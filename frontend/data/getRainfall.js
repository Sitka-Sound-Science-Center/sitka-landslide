const axios = require("axios");
const axiosRetry = require("axios-retry");
const { DateTime } = require("luxon");
const fs = require("fs");

// For debugging: a multiplier applied to rainfall amounts to get the results up into an
// interesting range. Something in the 8-15 range will usually do the trick.
const EXAGGERATION_FACTOR = process.env.EXAGGERATION_FACTOR || 1;

const MESOWEST_API = "https://api.synopticdata.com/v2";
const MESOWEST_TOKEN = process.env.MESOWEST_TOKEN || "55162f4800b34421b4a4d87491709620";

const NWS_API = "https://api.weather.gov/gridpoints/AJK/187,111";
const STATION_LAT = 57.053;
const STATION_LON = -135.36;
const NWS_ALERT_API = `https://api.weather.gov/alerts/active?status=actual&message_type=alert&point=${STATION_LAT},${STATION_LON}`;
// NWS doesn't require authentication, but they ask for an identifiable user-agent
const NWS_USERAGENT = "(Sitka Landslide Risk Forecasting, systems@azavea.com)";
// The link to provide when there's an active alert (it's just the current forecast page)
const NWS_ALERT_PERMALINK = `https://forecast.weather.gov/MapClick.php?lat=${STATION_LAT}&lon=${STATION_LON}`;

// Configure retries for requests. 3 retries (4 tries). The default exponential delay intervals
// are 100ms, 200ms, and 400ms, plus a random amount of padding from 0-20%.
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  // Condition for whether or not the error is one that should be retried. Modified to add logging.
  retryCondition: (err) => {
    const shouldRetry = axiosRetry.isSafeRequestError(err);
    console.log(`Request error for ${err.config.url}.` + (shouldRetry ? " Retrying." : ""));
    return shouldRetry;
  },
});

// Converts any ISO timestamp (whether it's in UTC or local time) to a luxon DateTime
// instance in Sitka local time
function toLocalDateTime(isoTimestamp) {
  return DateTime.fromISO(isoTimestamp, {
    zone: "America/Sitka",
  });
}

// Converts any ISO timestamp to one in Sitka local time
function toLocalTimestamp(isoTimestamp) {
  return toLocalDateTime(isoTimestamp).toString();
}

function toDateTimeDetails(isoTimestamp) {
  const dt = toLocalDateTime(isoTimestamp);
  const endDt = dt.plus({ hours: 3 });
  return {
    label: `${dt.toFormat("LLL d")} · ${dt.toFormat("ha")} to ${endDt.toFormat("ha")}`,
    dateAbbr: dt.toFormat("LLL d"),
    dateFull: dt.toFormat("LLLL d"),
    timeStart: dt.toFormat("ha"),
    timeEnd: endDt.toFormat("ha"),
  };
}

function toShortTimestamp(isoTimestamp) {
  const ts = toLocalTimestamp(isoTimestamp);
  return ts.substring(0, 16);
}

// Returns a DateTime for the end of the third day from now (in Sitka time)
// Note: This only gets used once, so it could be inline, but making it self-contained and
// putting it with the other datetime-related functions seemed nicer.
function calculateEndOfThirdDay() {
  const twoDaysHence = DateTime.now({ zome: "America/Sitka" }).plus({ days: 2 });
  return DateTime.fromObject(
    {
      year: twoDaysHence.year,
      month: twoDaysHence.month,
      day: twoDaysHence.day,
      hour: 23,
      minute: 59,
    },
    { zone: "America/Sitka" }
  );
}

// Utility function to log errors Axios errors.
function logRequestError(error) {
  console.log("==== ERROR ====");
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log(`Error: HTTP ${error.response.status} response from ${error.config.url}`);
    console.log(error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    console.log(`Error: Request to ${error.config.url} got no response.`);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log("Error:", error.message);
  }
}

// Apparently there's no builtin Javascript function that actually rounds decimals properly.
// But there are workarounds. https://www.jacklmoore.com/notes/rounding-in-javascript/ has one,
// but it breaks down (badly--it returns NaN) if the number is already in scientific notation.
// https://sanori.github.io/2019/04/JavaScript-Pitfalls-Tips-toFixed/ has a more robust one.
function round(value, decimals) {
  const placeMultiplier = Math.pow(10, decimals);
  return Number((Math.floor(value * placeMultiplier + 0.5) / placeMultiplier).toFixed(decimals));
}

function mmToInches(mm) {
  return round(mm / 25.4, 2);
}

// Landslide probability predicted by the model, given 3hr rainfall (in mm)
function landslideProbability(rainfall) {
  const intercept = -13.7821;
  const coefficient = 0.4294;
  const prob =
    Math.exp(intercept + coefficient * rainfall) /
    (1 + Math.exp(intercept + coefficient * rainfall));
  return prob;
}

// Landslide risk rating based on calculated probability from 3hr rainfall (in mm)
function landslideRisk(rainfall) {
  const prob = landslideProbability(rainfall);
  if (prob <= 0.01) {
    return 0;
  } else if (prob <= 0.7) {
    return 1;
  } else if (prob > 0.7) {
    return 2;
  } else {
    throw `Error processing rainfall data: rainfall ${rainfall}, landslide probability ${prob}`;
  }
}

// For the charts that show a continuous scale, we want the low/med/high progression to make
// visual sense, i.e. for Low to cover one third, Med to cover the middle third, etc.
// To make that work, we need to map the calculated probablity onto a range representing where on
// low/medium/high risk spectrum it falls.
function normalizedRiskNum(rainfall) {
  const prob = landslideProbability(rainfall);
  if (prob <= 0.01) {
    return prob / 0.01 / 3;
  } else if (prob <= 0.7) {
    return 1 / 3 + (prob - 0.01) / (0.7 - 0.01) / 3;
  } else {
    return 2 / 3 + (prob - 0.7) / 0.3 / 3;
  }
}

// Download observed 3hr rainfall total at the Sitka airport weather station over the past 6 hours
async function getPastRainfall() {
  const COMMON_MESOWEST_PARAMS = {
    token: MESOWEST_TOKEN,
    stid: "PASI", // Sitka airport station ID
    obtimezone: "local",
    precip: 1, // https://developers.synopticdata.com/mesonet/v2/stations/timeseries/
  };
  const [threeHourResponse, sixHourResponse] = await Promise.all([
    axios
      .get(`${MESOWEST_API}/stations/timeseries`, {
        params: { ...COMMON_MESOWEST_PARAMS, recent: 60 * 3 },
      })
      .catch(logRequestError),
    axios
      .get(`${MESOWEST_API}/stations/timeseries`, {
        params: { ...COMMON_MESOWEST_PARAMS, recent: 60 * 6 },
      })
      .catch(logRequestError),
  ]);

  if (!threeHourResponse || !sixHourResponse) {
    return null;
  }

  // Pull the observations out from the depths of the response
  const threeHourObs = threeHourResponse.data.STATION[0].OBSERVATIONS.precip_accumulated_set_1d;
  const sixHourObs = sixHourResponse.data.STATION[0].OBSERVATIONS.precip_accumulated_set_1d;
  const threeHourTimestamps = threeHourResponse.data.STATION[0].OBSERVATIONS.date_time;

  // Each `precip_accumulated_set_1d` field is an array where the individual entries are running
  // totals of precipitation over the lookback period up to that point, so to get the total for the
  // entire period, we need to take the last element.
  const threeHourTotal = threeHourObs[threeHourObs.length - 1] * EXAGGERATION_FACTOR;
  const sixHourTotal = sixHourObs[sixHourObs.length - 1] * EXAGGERATION_FACTOR;
  const precip = round(threeHourTotal, 4);
  const prevPrecip = round(sixHourTotal - threeHourTotal, 4);

  // If the earlier precip was higher than the recent total, by enough to cause the risk level to
  // be higher than it would for the recent amount, calculate risk based on that higher total.
  const riskIsElevatedFromPreviousPrecip = landslideRisk(prevPrecip) > landslideRisk(precip);
  const riskPrecip = riskIsElevatedFromPreviousPrecip ? prevPrecip : precip;

  return {
    timestamp: toLocalTimestamp(threeHourTimestamps[threeHourTimestamps.length - 1]),
    dateTimeDetails: { label: "Past 3 hours" },
    precip,
    precipInches: mmToInches(precip),
    prevPrecip, // Needed for the look-back window of the first forecast period
    riskProb: round(normalizedRiskNum(riskPrecip), 4),
    riskLevel: landslideRisk(riskPrecip),
    riskIsElevatedFromPreviousPrecip,
  };
}

// Download predicted 3hr rainfall amounts NWS from the grid cell containing Sitka airport
// The argument is the past two 3hr totals, as an array
async function getForecastRainfall(observed) {
  const nwsResponse = await axios
    .get(NWS_API, {
      headers: { "User-Agent": NWS_USERAGENT },
    })
    .catch(logRequestError);

  if (!nwsResponse) {
    return null;
  }

  // Get precip values from response, keeping only ones with a 3-hour window
  const data = nwsResponse.data.properties.quantitativePrecipitation.values.filter((f) =>
    f.validTime.endsWith("PT3H")
  );

  const forecasts = data.map((f) => ({
    // The timestamp format is an ISO date string plus an interval. We only want the datetime.
    timestamp: toLocalTimestamp(f.validTime.split("/")[0]),
    precip: f.value * EXAGGERATION_FACTOR,
  }));

  // Filter out forecasts periods that are fully in the past (i.e. started more than 3 hours ago)
  const futureForecasts = forecasts.filter(
    (f) => DateTime.fromISO(f.timestamp) > DateTime.now().minus({ hours: 3 })
  );

  // Get the rainfall amounts, with the most recent observations prepended, then for each
  // forecast, calculate risk based on the highest rainfall amount from the period in
  // question or the two previous 3-hour chunks.
  const prevPrecip = observed.concat(futureForecasts.map((f) => f.precip));
  const riskForecasts = futureForecasts.map((forecast, i) => {
    // If the forecast total for one of the previous periods is higher than the total for the
    // period in question by enough to cause increased risk, calculate the risk based on the
    // higher total.
    const maxPrecip = Math.max(forecast.precip, prevPrecip[i], prevPrecip[i + 1]);
    const riskIsElevatedFromPreviousPrecip =
      landslideRisk(maxPrecip) > landslideRisk(forecast.precip);
    const riskPrecip = riskIsElevatedFromPreviousPrecip ? maxPrecip : forecast.precip;

    return {
      ...forecast,
      precipInches: mmToInches(forecast.precip),
      hour: toLocalDateTime(forecast.timestamp).toFormat("ha"),
      shortTimestamp: toShortTimestamp(forecast.timestamp),
      dateTimeDetails: toDateTimeDetails(forecast.timestamp),
      riskProb: round(normalizedRiskNum(riskPrecip), 4),
      riskLevel: landslideRisk(riskPrecip),
      riskIsElevatedFromPreviousPrecip,
    };
  });
  return riskForecasts;
}

// Get current weather advisory status
// Note: We don't want an error here to block an update, so if the API call fails it just
//       returns a valid object with {active: false}.
async function getWeatherAdvisory() {
  const defaultResult = {
    active: false,
    permalink: NWS_ALERT_PERMALINK,
  };
  return axios
    .get(NWS_ALERT_API, {
      headers: { "User-Agent": NWS_USERAGENT },
    })
    .then((nwsResponse) => {
      return {
        ...defaultResult,
        active: nwsResponse?.data?.features?.length > 0,
      };
    })
    .catch((error) => {
      logRequestError(error);
      return defaultResult;
    });
}

function composeTwentyFourHours(forecasts) {
  const hours = forecasts.filter(
    (f) => DateTime.fromISO(f.timestamp) <= DateTime.now().plus({ hours: 24 })
  );
  const riskLevel = Math.max(...hours.map((h) => h.riskLevel));
  return {
    riskLevel,
    hours,
  };
}

function composeThreeDays(forecasts) {
  // Get all the hourly forecasts for the next three days
  const endOfThirdDay = calculateEndOfThirdDay();
  const hours = forecasts
    .filter((f) => DateTime.fromISO(f.timestamp) <= endOfThirdDay)
    .map((f) => {
      return {
        ...f,
        dayNumber: toLocalDateTime(f.timestamp).toFormat("c"),
        dayName: toLocalDateTime(f.timestamp).toFormat("cccc"),
      };
    });
  // Collect daily summaries, with the highest risk for each calendar day
  const daysObject = hours.reduce((daysAcc, hour) => {
    daysAcc[hour.dayNumber] = {
      dayNumber: hour.dayNumber,
      dayName: hour.dayName,
      riskLevel: Math.max(hour.riskLevel, daysAcc[hour.dayNumber]?.riskLevel || 0),
      lastTimestamp: hour.timestamp,
    };
    return daysAcc;
  }, {});
  // Make sure they come out sorted chronologically, even if the week wraps around
  const days = Object.values(daysObject).sort((a, b) =>
    a.lastTimestamp >= b.lastTimestamp ? 1 : -1
  );
  return {
    days,
    hours,
  };
}

async function rainfall() {
  const current = await getPastRainfall();
  if (current) {
    // Pass the observed amounts to the forecast function for use in the look-back of the first
    // couple forecast periods.
    const forecasts = await getForecastRainfall([current.prevPrecip, current.precip]);
    if (forecasts) {
      const twentyFourHours = composeTwentyFourHours(forecasts);
      const threeDays = composeThreeDays(forecasts);
      return {
        lastUpdated: toLocalTimestamp(DateTime.now()),
        weatherAdvisory: await getWeatherAdvisory(),
        current,
        twentyFourHours,
        threeDays,
      };
    }
  }

  // If it didn't return above, throw an error.
  throw "Failed to load observed or forecast rainfall data.";
}

async function saveRainfall() {
  const rainfallData = await rainfall();
  fs.writeFileSync("data/rainfall.json", JSON.stringify(rainfallData, null, 2));
}

saveRainfall();
