const asyncHandler = require('express-async-handler');
const utils = require('../utils');
const saIndividualDetailsService = require('../services/saIndividualDetailsService');

const getItsaStatus = asyncHandler(async(req, res) => {
  // Get query parameters
  const nino = req.query.nino;
  let taxYear = req.query.taxYear;

  // Default to current tax year
  if (!taxYear) { taxYear = utils.getCurrentTaxYear()};

  // Get ITSA status
  const apiResponse = await saIndividualDetailsService.getItsaStatus(nino, taxYear, req);

  return res.status(apiResponse.status).json(apiResponse.body);
})

module.exports = { 
  getItsaStatus
};