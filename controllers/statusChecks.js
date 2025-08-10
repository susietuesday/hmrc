const asyncHandler = require('express-async-handler');
const utils = require('../utils');

// services/statusCheckService.js
const saIndividualDetails = require('../services/saIndividualDetailsService');
const businessDetails = require('../services/businessDetailsService');
//const { getObligationsStatus } = require('./obligationsService');

const runAllStatusChecks = asyncHandler(async(req, res) => {
  const nino = req.query.nino;

  // Default tax year to current year
  const taxYear = utils.getCurrentTaxYear();

  const mtdEligible = await saIndividualDetails.getMtdEligible(nino, taxYear, req);
  const businessId = await businessDetails.getUkPropertyBusinessId(req, nino);
  //const obligations = await getObligationsStatus(nino);

  res.render('status-checks', {
    itsaStatus: mtdEligible,
    propertyRegistered: businessId !== null && businessId !== undefined,
    openObligation: false
  });
});

module.exports = { runAllStatusChecks };