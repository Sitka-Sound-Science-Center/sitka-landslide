// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import data from "/data/id_logit_3hr.js";

export default function handler(req, res) {
  res.status(200).json(data);
}
