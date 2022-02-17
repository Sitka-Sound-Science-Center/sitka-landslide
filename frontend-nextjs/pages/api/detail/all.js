export default function handler(req, res) {
  res.status(200).json([
    {
      params: { date: "2022-04-05T03:00:00", id: "0001" },
    },
    {
      params: { date: "2022-04-05T06:00:00", id: "0002" },
    },
    {
      params: { date: "2022-04-05T09:00:00", id: "0003" },
    },
  ]);
}
