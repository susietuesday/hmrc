const asyncHandler = require('express-async-handler');
const { getBusinessListByNino } = require('../services/businessDetailsService');

const fetchBusinessList = asyncHandler(async (req, res) => {
  const nino = req.query.nino;

  if (!nino) {
    return res.status(400).send("Missing NINO in query string");
  }

  const apiResponse = await getBusinessListByNino({ req, nino });

  return res.status(apiResponse.status).json(apiResponse.body);
});

module.exports = {
    fetchBusinessList
};
