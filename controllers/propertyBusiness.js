const asyncHandler = require('express-async-handler');
const propertyBusinessService = require('../services/propertyBusinessService.js');
const utils = require('../utils/utils.js')

const messages = {
  MATCHING_RESOURCE_NOT_FOUND: 'No cumulative summary data is available yet. Please submit your quarterly updates first.',
  RULE_TAX_YEAR_NOT_SUPPORTED: 'The tax year specified does not lie within the supported range.'
};

const getUkPropertyCumulativeSummary = asyncHandler(async (req, res) => {
  const nino = req.session.user.nino;
  const businessId = req.session.user.ukPropertyBusinessId;
  const taxYear = utils.getCurrentTaxYear();

  if (!nino) {
    return res.status(400).send('NINO is required');
  }

  const apiResponse = await propertyBusinessService.getUkPropertyCumulativeSummary({
    nino,
    businessId,
    taxYear,
    context: req.context
  });

  // Map the code to a message, fallback if unknown
  const message = messages[apiResponse.body.code] || apiResponse.body.message;

  const status = (apiResponse.status === 200 || apiResponse.status === 404)
  ? 200
  : apiResponse.status;

  return res.status(200).json({
    hmrcStatus: apiResponse.status, // HMRC HTTP status
    message,
    body: apiResponse.body
  });
});

module.exports = { 
  getUkPropertyCumulativeSummary
};