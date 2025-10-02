const businessDetailsClient = require('../clients/businessDetailsClient.js');

async function getBusinessList({ nino, context }) {
  const response = businessDetailsClient.fetchBusinessDetailsList({ nino, context });
  return response;
}

async function getUkPropertyBusinessId({nino, context}) {
  const data = await getBusinessList({ nino, context });

  if (!data || !Array.isArray(data.body.listOfBusinesses)) return null;

  const ukProperty = data.body.listOfBusinesses.find(
    (business) => business.typeOfBusiness === 'uk-property'
  );

  return ukProperty ? ukProperty.businessId : null;
};

module.exports = { getBusinessList, getUkPropertyBusinessId };