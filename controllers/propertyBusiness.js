const asyncHandler = require('express-async-handler');
const propertyBusinessService = require('../services/propertyBusinessService.js');

const postUkPropertyPeriodSummary = asyncHandler(async (req, res) => { 
  const nino = req.body.nino;
  const businessId = 'XBIS12345678901'
  const taxYear = '2024-25'

  if (!nino) {
    return res.status(400).send('NINO is required');
  }
  
  const apiResponse = await propertyBusinessService.createUkPropertyPeriodSummary({
    nino, 
    businessId, 
    taxYear,
    session: req.session
  });

  return res.status(apiResponse.status).json(apiResponse.body);
});

module.exports = { 
  postUkPropertyPeriodSummary
};