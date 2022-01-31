export default function handler(req, res) {
  const { id } = req.query;

  const database = {
    "0001": {
      timestamp: "2020-12-18T03:00:00",
      precip_mm_max3hr: 0,
      risk: "low",
    },
    "0002": {
      timestamp: "2020-12-13T06:00:00",
      precip_mm_max3hr: 30.5,
      risk: "high",
    },
    "0003": {
      timestamp: "2020-12-13T09:00:00",
      precip_mm_max3hr: 18,
      risk: "medium",
    },
  };

  const match = database[id];

  res.status(200).json(match);
}
