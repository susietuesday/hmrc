const obligationsRepo = require('../repositories/obligationsRepo');

async function getIncomeAndExpenditureObligations({nino, session}) {

  // Build query parameters
  const params = {
    typeOfBusiness: 'uk-property',
    //businessId: req.session.user.ukPropertyBusinessId
    businessId: 'XPIS12345678901',
    fromDate: '2025-04-06',
    toDate: '2025-07-05'
    //status: ''
  }

  const response = await obligationsRepo.fetchIncomeAndExpenditureObligations({
    nino, 
    params, 
    session
  });

  return response;
}

module.exports = {
  getIncomeAndExpenditureObligations,
};
