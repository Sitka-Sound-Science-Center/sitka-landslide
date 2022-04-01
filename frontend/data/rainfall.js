import axios from "axios";
import { DateTime } from "luxon";

const MESOWEST_API = "https://api.synopticdata.com/v2";
const MESOWEST_TOKEN = process.env.MESOWEST_TOKEN || "78b6412c25ea43beb10aa5399dd6fdfa";

const NWS_API = "https://api.weather.gov/gridpoints/AJK/188,113";
// NWS doesn't require authentication, but they ask for an identifiable user-agent
const NWS_USERAGENT = "(Sitka Landslide Risk Forecasting, systems@azavea.com)";

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

// Utility function to log errors. I just lifted the example right out of the Axios docs.
function logRequestError(error) {
  console.log("==== ERROR ====");
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.log(error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log("Error", error.message);
  }
  console.log(error.config);
}

// Apparently rounding is a mess in Javascript and this mess is the preferred workaround
// See https://www.jacklmoore.com/notes/rounding-in-javascript/
function round(value, decimals) {
  return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
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
  } else {
    return 2;
  }
}

// Download observed 3hr rainfall total at the Sitka airport weather station over the past 6 hours
async function getPastRainfall() {
  const mesoResponse = await axios.get(`${MESOWEST_API}/stations/precip`, {
    params: {
      token: MESOWEST_TOKEN,
      stid: "PASI", // Sitka airport station ID
      pmode: "last",
      accum_hours: "3,6",
      obtimezone: "local",
    },
  });

  // Pull the observations out from the depths of the response
  const data = mesoResponse.data.STATION[0].OBSERVATIONS.precipitation;
  const threeHourObs = data.find((d) => d.accum_hours === 3);
  const sixHourObs = data.find((d) => d.accum_hours === 6);
  // Calculate risk based on the highest 3-hour precip within the past 6 hours
  const riskPrecip = Math.max(threeHourObs.total, sixHourObs.total - threeHourObs.total);

  return {
    timestamp: toLocalTimestamp(threeHourObs.last_report),
    precip: threeHourObs.total,
    riskPrecip: riskPrecip,
    riskLevel: landslideRisk(riskPrecip),
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

  // Get precip values from response, keeping only ones with a 3-hour window
  const data = nwsResponse.data.properties.quantitativePrecipitation.values.filter((f) =>
    f.validTime.endsWith("PT3H")
  );

  const forecasts = data.map((f) => ({
    // The timestamp format is an ISO date string plus an interval. We only want the datetime.
    timestamp: toLocalTimestamp(f.validTime.split("/")[0]),
    precip: f.value,
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
    const riskPrecip = Math.max(forecast.precip, prevPrecip[i], prevPrecip[i + 1]);
    return {
      ...forecast,
      hour: toLocalDateTime(forecast.timestamp).toFormat("ha"),
      riskPrecip,
      riskProb: round(landslideProbability(riskPrecip), 4),
      riskLevel: landslideRisk(riskPrecip),
    };
  });
  return riskForecasts;
}

// Get current weather advisory status
// TODO (#16): implement this. currently it's just a placeholder.
// Note: This shouldn't block an update, so if the API call fails it should return a
//       valid object with {active: false}.
async function getWeatherAdvisory() {
  return {
    active: false,
    permalink: "https://forecast.weather.gov/MapClick.php?lat=57.052&lon=-135.334",
  };
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
  const hours = forecasts
    .filter((f) => DateTime.fromISO(f.timestamp) <= DateTime.now().plus({ days: 3 }))
    .map((f) => {
      return {
        ...f,
        dayNumber: toLocalDateTime(f.timestamp).toFormat("c"),
        dayName: toLocalDateTime(f.timestamp).toFormat("cccc"),
      };
    });
  const days = Object.values(
    hours.reduce((daysAcc, hour) => {
      daysAcc[hour.dayNumber] = {
        dayNumber: hour.dayNumber,
        dayName: hour.dayName,
        riskLevel: Math.max(hour.riskLevel, daysAcc[hour.dayNumber]?.riskLevel || 0),
      };
      return daysAcc;
    }, {})
  );
  return {
    days,
    hours,
  };
}

export default async function rainfall() {
  const current = await getPastRainfall();
  // Pass the observed amounts to the forecast function for use in the look-back of the first
  // couple forecast periods. Note that 'riskPrecip' could be the earlier observation or it could
  // be a copy of the most recent one, depending on which was higher, but since the calculations
  // just want to know the max, it doesn't matter.
  const forecasts = await getForecastRainfall([current.riskPrecip, current.precip]);
  const twentyFourHours = composeTwentyFourHours(forecasts);
  const threeDays = composeThreeDays(forecasts);
  if (current && forecasts) {
    const result = {
      lastUpdated: toLocalTimestamp(DateTime.now()),
      weatherAdvisory: await getWeatherAdvisory(),
      current,
      twentyFourHours,
      threeDays,
    };

    // console.log(JSON.stringify(result, null, 2));
    return result;
  }
}
