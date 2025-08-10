const asyncHandler = require('express-async-handler');
const obligationsService = require('../services/obligationsService');

const getIncomeAndExpenditureObligations = asyncHandler(async(req, res) => {
  const nino = req.query.nino;
  if (!nino) {
    return res.status(400).json({ error: 'Missing NINO in query string' });
  }

  const apiResponse = await obligationsService.getIncomeAndExpenditureObligations(nino, req);

  return res.status(apiResponse.status).json(apiResponse.body);
})

module.exports = { 
  getIncomeAndExpenditureObligations
};