const obligationsClient = require('../clients/obligationsClient.js');

async function getObligations({nino, context}) {

  // Build query parameters
  const params = {
    typeOfBusiness: 'uk-property',
    //businessId: req.session.user.ukPropertyBusinessId
    businessId: 'XPIS12345678901',
    fromDate: '2025-04-06',
    toDate: '2025-07-05'
    //status: ''
  }

  const response = await obligationsClient.fetchObligations({
    nino, 
    params, 
    context
  });

  return response;
}

module.exports = {
  getObligations,
};
