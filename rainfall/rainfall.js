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

// Download observed 3hr rainfall totals over the past 24 hrs from the Sitka airport weather station
const getPast24hrRainfall = async () => {
  // Get the data
  const mesoResponse = await axios
    .get(`${MESOWEST_API}/stations/timeseries`, {
      params: {
        token: MESOWEST_TOKEN,
        stid: "PASI", // Sitka airport station ID
        vars: "precip_accum_three_hour",
        recent: "1440", // Observations within the past 24 hours (1440 minutes)
        obtimezone: "local",
      },
    })
    .catch(logRequestError);

  console.log("HMM", mesoResponse)
  // Parse results into an array of [timestamp, value] pairs
  const data = mesoResponse.data.STATION[0].OBSERVATIONS;
  const obs = data.date_time.map((time, i) => [time, data.precip_accum_three_hour_set_1[i]]);

  return obs.map(([time, rainfall]) => ({
    timestamp: toLocalTimestamp(time),
    precip: rainfall,
    risk: landslideRisk(rainfall),
  }));
};

// Download observed 3hr rainfall total at the Sitka airport weather station over the past 3 hours
const getPast3hrRainfall = async () => {
  const mesoResponse = await axios.get(`${MESOWEST_API}/stations/precip`, {
    params: {
      token: MESOWEST_TOKEN,
      stid: "PASI", // Sitka airport station ID
      pmode: "last",
      accum_hours: 3,
      obtimezone: "local",
    },
  });

  // There's only one data point, but it's nested deeply
  const data = mesoResponse.data.STATION[0].OBSERVATIONS.precipitation[0];

  return {
    timestamp: toLocalTimestamp(data.last_report),
    precip: data.total,
    risk: landslideRisk(data.total),
  };
};

// Download predicted 3hr rainfall amounts NWS from the grid cell containing Sitka airport
const getForecastRainfall = async () => {
  const nwsResponse = await axios.get(NWS_API, {
    headers: { "User-Agent": NWS_USERAGENT },
  }).catch(logRequestError);

  // Get precip values from response, keeping only ones with a 3-hour window
  const data = nwsResponse.data.properties.quantitativePrecipitation.values.filter((f) =>
    f.validTime.endsWith("PT3H")
  );

  const forecasts = data.map((f) => ({
    // The timestamp format is an ISO date string plus an interval. We only want the datetime.
    timestamp: toLocalTimestamp(f.validTime.split("/")[0]),
    precip: f.value,
    risk: landslideRisk(f.value),
  }));
  // Filter out forecasts periods that are fully in the past (i.e. started more than 3 hours ago)
  const futureForecasts = forecasts.filter(
    (f) => DateTime.fromISO(f.timestamp) > DateTime.now().minus({ hours: 3 })
  );
  return futureForecasts;
};

console.log("MesoWest time series, 3-hour precip for past 24 hours:");
const past = await getPast24hrRainfall();
past.forEach((o) => console.log(o));

console.log("MesoWest precip, past 3 hours:");
const current = await getPast3hrRainfall();
console.log(current);

console.log("NWS 3-hour quantitative precip forecasts:");
const future = await getForecastRainfall();
future.forEach((o) => console.log(o));

// console.log(
//   JSON.stringify(
//     {
//       current: await getPast3hrRainfall(),
//       forecast: await getForecastRainfall(),
//     },
//     null,
//     2
//   )
// );
