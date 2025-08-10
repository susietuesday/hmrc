const asyncHandler = require('express-async-handler');
const utils = require('../utils');

// services/statusCheckService.js
const { getMtdEligible } = require('../services/saIndividualDetailsService');
//const { getBusinessStatus } = require('./businessDetailsService');
//const { getObligationsStatus } = require('./obligationsService');

const runAllStatusChecks = asyncHandler(async(req, res) => {
  const nino = req.query.nino;

  // Default tax year to current year
  const taxYear = utils.getCurrentTaxYear();

  const mtdEligible = await getMtdEligible(nino, taxYear, req);
  //const business = await getBusinessStatus(nino);
  //const obligations = await getObligationsStatus(nino);

  res.render('status-checks', {
    itsaStatus: mtdEligible,
    propertyRegistered: false,
    openObligation: false
  });
  
  //return { selfAssessment, business, obligations };
});

module.exports = { runAllStatusChecks };