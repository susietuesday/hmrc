const obligationsRepo = require('../repositories/obligationsRepo');

async function getIncomeAndExpenditureObligations(nino, req) {

  // Build query parameters
  const params = {
    typeOfBusiness: 'uk-property',
    //businessId: req.session.user.ukPropertyBusinessId
    businessId: 'XPIS12345678903'
  }

  const response = await obligationsRepo.fetchIncomeAndExpenditureObligations(nino, params, req); 
  return response;
}

module.exports = {
  getIncomeAndExpenditureObligations,
};
