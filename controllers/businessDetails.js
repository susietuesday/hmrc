const asyncHandler = require('express-async-handler');
const { fetchBusinessListByNino } = require('../services/businessDetailsService');

const getBusinessList = asyncHandler(async (req, res) => {
  const nino = req.query.nino;

  if (!nino) {
    return res.status(400).send("Missing NINO in query string");
  }

  const apiResponse = await fetchBusinessListByNino({ req, nino });

  // Set UK property business ID
  req.session.user.ukPropertyBusinessId = getUkPropertyBusinessId(apiResponse.body);

  return res.status(apiResponse.status).json(apiResponse.body);
});

function getUkPropertyBusinessId(data) {
  console.log('Received data:', data);

  if (!data || !Array.isArray(data.listOfBusinesses)) return null;

  const ukProperty = data.listOfBusinesses.find(
    (business) => business.typeOfBusiness === 'uk-property'
  );

  return ukProperty ? ukProperty.businessId : null;
}

module.exports = {
  getBusinessList
};
