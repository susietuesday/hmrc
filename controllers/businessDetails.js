const asyncHandler = require('express-async-handler');
const businessDetailsService = require('../services/businessDetailsService');

const getBusinessList = asyncHandler(async (req, res) => {
  const nino = req.query.nino;

  if (!nino) {
    return res.status(400).send("Missing NINO in query string");
  }

  const apiResponse = await businessDetailsService.getBusinessList({ req, nino });

  return res.status(apiResponse.status).json(apiResponse.body);
});

module.exports = {
  getBusinessList
};
