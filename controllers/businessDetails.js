const asyncHandler = require('express-async-handler');
const { fetchBusinessListByNino } = require('../services/businessDetailsService');

const getBusinessList = asyncHandler(async (req, res) => {
  const nino = req.query.nino;

  if (!nino) {
    return res.status(400).send("Missing NINO in query string");
  }

  const apiResponse = await fetchBusinessListByNino({ req, nino });

  return res.status(apiResponse.status).json(apiResponse.body);
});

module.exports = {
  getBusinessList
};
