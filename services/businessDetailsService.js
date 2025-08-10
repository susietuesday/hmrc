const businessDetailsRepo = require('../repositories/businessDetailsRepo.js');

async function getBusinessList({ req, nino }) {
  const response = businessDetailsRepo.fetchBusinessDetailsList({ req, nino });

  return response;
}

module.exports = { getBusinessList }