const businessDetailsRepo = require('../repositories/businessDetailsRepo.js');

async function getBusinessList({ req, nino }) {
  const response = businessDetailsRepo.fetchBusinessDetailsList({ req, nino });
  return response;
}

async function getUkPropertyBusinessId(req, nino) {
  const data = await getBusinessList({ req, nino });

  if (!data || !Array.isArray(data.body.listOfBusinesses)) return null;

  const ukProperty = data.body.listOfBusinesses.find(
    (business) => business.typeOfBusiness === 'uk-property'
  );

  // Set UK property business ID in session
  req.session.user.ukPropertyBusinessId = ukProperty ? ukProperty.businessId : null;
  return ukProperty ? ukProperty.businessId : null;
};

module.exports = { getBusinessList, getUkPropertyBusinessId };