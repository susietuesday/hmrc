const businessDetailsRepo = require('../repositories/businessDetailsRepo.js');

async function getBusinessList({ nino, session }) {
  const response = businessDetailsRepo.fetchBusinessDetailsList({ nino, session });
  return response;
}

async function getUkPropertyBusinessId({nino, session}) {
  const data = await getBusinessList({ nino, session });

  if (!data || !Array.isArray(data.body.listOfBusinesses)) return null;

  const ukProperty = data.body.listOfBusinesses.find(
    (business) => business.typeOfBusiness === 'uk-property'
  );

  return ukProperty ? ukProperty.businessId : null;
};

module.exports = { getBusinessList, getUkPropertyBusinessId };