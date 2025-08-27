const asyncHandler = require('express-async-handler');
const propertyBusinessService = require('../services/propertyBusinessService.js');

const getUkPropertyCumulativeSummary = asyncHandler(async (req, res) => {
  const nino = req.query.nino;
  const businessId = req.session.user.ukPropertyBusinessId;
  const taxYear = '2025-26'

  if (!nino) {
    return res.status(400).send('NINO is required');
  }

  const apiResponse = await propertyBusinessService.getUkPropertyCumulativeSummary({
    nino,
    businessId,
    taxYear,
    session: req.session
  });

  return res.status(apiResponse.status).json(apiResponse.body);
});

module.exports = { 
  getUkPropertyCumulativeSummary
};