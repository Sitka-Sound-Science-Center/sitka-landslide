import axios from "axios";
import { DateTime } from "luxon";

const MESOWEST_API = "https://api.synopticdata.com/v2";
const MESOWEST_TOKEN = process.env.MESOWEST_TOKEN || "78b6412c25ea43beb10aa5399dd6fdfa";

const NWS_API = "https://api.weather.gov/gridpoints/AJK/188,113";
// NWS doesn't require authentication, but they ask for an identifiable user-agent
const NWS_USERAGENT = "(Sitka Landslide Risk Forecasting, systems@azavea.com)";

// Converts any ISO timestamp (whether it's in UTC or local time) to one in Sitka local time
const toLocalTimestamp = (isoTimestamp) => {
  return DateTime.fromISO(isoTimestamp, {
    zone: "America/Sitka",
  }).toString();
};

// Utility function to log errors. I just lifted the example right out of the Axios docs.
const logRequestError = (error) => {
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
};

// Landslide probability predicted by the model, given 3hr rainfall (in mm)
const landslideProbability = (rainfall) => {
  const intercept = -13.7821;
  const coefficient = 0.4294;
  const prob =
    Math.exp(intercept + coefficient * rainfall) /
    (1 + Math.exp(intercept + coefficient * rainfall));
  return prob;
};

// Landslide risk rating based on calculated probability from 3hr rainfall (in mm)
const landslideRisk = (rainfall) => {
  const prob = landslideProbability(rainfall);
  if (prob <= 0.01) {
    return "Low";
  } else if (prob <= 0.7) {
    return "Moderate";
  } else {
    return "High";
  }
};

// Download observed 3hr rainfall total at the Sitka airport weather station over the past 6 hours
const getPastRainfall = async () => {
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
    risk: landslideRisk(riskPrecip),
  };
};

// Download predicted 3hr rainfall amounts NWS from the grid cell containing Sitka airport
// The argument is the past two 3hr totals, as an array
const getForecastRainfall = async (observed) => {
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
  const riskForecasts = futureForecasts.map((f, i) => {
    const riskPrecip = Math.max(f.precip, prevPrecip[i], prevPrecip[i + 1]);
    return {
      ...f,
      riskPrecip,
      risk: landslideRisk(riskPrecip),
    };
  });
  return riskForecasts;
};

const observed = await getPastRainfall();
// Pass the observed amounts to the forecast function for use in the look-back of the first
// couple forecast periods. Note that 'riskPrecip' could be the earlier observation or it could
// be a copy of the most recent one, depending on which was higher, but since the calculations
// just wants to know the max, it doesn't matter.
const forecast = await getForecastRainfall([observed.riskPrecip, observed.precip]);
if (observed && forecast) {
  const result = {
    observed,
    forecast,
  };

  console.log(JSON.stringify(result, null, 2));
}
