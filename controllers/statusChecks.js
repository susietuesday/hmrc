const asyncHandler = require('express-async-handler');
const utils = require('../utils/utils');

// services/statusCheckService.js
const saIndividualDetails = require('../services/saIndividualDetailsService');
const businessDetails = require('../services/businessDetailsService');
const obligations = require('../services/obligationsService');

const runAllStatusChecks = asyncHandler(async(req, res) => {
  const nino = req.query.nino;

  // Default tax year to current year
  const taxYear = utils.getCurrentTaxYear();

  const mtdEligible = await saIndividualDetails.getMtdEligible({nino, taxYear, session: req.session});
  const businessId = await businessDetails.getUkPropertyBusinessId({nino, session: req.session});
  // Set UK property business ID in session
  req.session.user.ukPropertyBusinessId = businessId;

  const obligationsData = await obligations.getIncomeAndExpenditureObligations({nino, session: req.session});

  res.render('dashboard', {
    itsaStatus: mtdEligible,
    propertyRegistered: businessId !== null && businessId !== undefined,
    obligationsData: obligationsData.body
  });
});

module.exports = { runAllStatusChecks };