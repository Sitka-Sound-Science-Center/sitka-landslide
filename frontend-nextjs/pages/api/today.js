// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  // res.status(200).json({
  //   hour24: [
  //     { id: 0, time: "3PM", risk: 0.1, riskLevel: "low" },
  //     { id: 1, time: "6PM", risk: 0.08, riskLevel: "low" },
  //     { id: 2, time: "9PM", risk: 0.12, riskLevel: "low" },
  //     { id: 3, time: "12PM", risk: 0.13, riskLevel: "low" },
  //     { id: 4, time: "3AM", risk: 0.16, riskLevel: "low" },
  //     { id: 5, time: "6PM", risk: 0.18, riskLevel: "low" },
  //     { id: 6, time: "9PM", risk: 0.12, riskLevel: "low" },
  //     { id: 7, time: "12AM", risk: 0.07, riskLevel: "low" },
  //     { id: 8, time: "3AM", risk: 0.2, riskLevel: "low" },
  //   ],
  // });

  res.status(200).json({
    hour24: [
      {
        id: 0,
        date: "2022-04-05T03:00:00",
        time: "3PM",
        risk: 0.1,
        riskLevel: "low",
      },
      {
        id: 1,
        date: "2022-04-05T06:00:00",
        time: "6PM",
        risk: 0.08,
        riskLevel: "low",
      },
      {
        id: 2,
        date: "2022-04-05T09:00:00",
        time: "9PM",
        risk: 0.12,
        riskLevel: "low",
      },
      {
        id: 3,
        date: "2022-04-05T012:00:00",
        time: "12PM",
        risk: 0.13,
        riskLevel: "low",
      },
      {
        id: 4,
        date: "2022-04-05T15:00:00",
        time: "3AM",
        risk: 0.24,
        riskLevel: "low",
      },
      {
        id: 5,
        date: "2022-04-05T18:00:00",
        time: "6PM",
        risk: 0.34,
        riskLevel: "medium",
      },
      {
        id: 6,
        date: "2022-04-05T21:00:00",
        time: "9PM",
        risk: 0.38,
        riskLevel: "medium",
      },
      {
        id: 7,
        date: "2022-04-06T00:00:00",
        time: "12AM",
        risk: 0.41,
        riskLevel: "medium",
      },
      {
        id: 8,
        date: "2022-04-06T03:00:00",
        time: "3AM",
        risk: 0.46,
        riskLevel: "medium",
      },
    ],
  });
}
