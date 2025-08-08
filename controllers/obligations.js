const asyncHandler = require('express-async-handler');
const { fetchIncomeAndExpenditureObligations } = require('../services/obligationsService');

const getIncomeAndExpenditureObligations = asyncHandler(async(req, res) => {
  const nino = req.query.nino;
  if (!nino) {
    return res.status(400).json({ error: 'Missing NINO in query string' });
  }

  // Build query parameters
  const params = {
    typeOfBusiness: 'uk-property',
    //businessId: req.session.user.ukPropertyBusinessId
    businessId: 'XPIS12345678903'
  }

  const apiResponse = await fetchIncomeAndExpenditureObligations(nino, params, req);

  return res.status(apiResponse.status).json(apiResponse.body);
})

module.exports = { 
  getIncomeAndExpenditureObligations
};