const asyncHandler = require('express-async-handler');
const utils = require('../utils/utils');

const saIndividualDetails = require('../services/saIndividualDetailsService');
const businessDetails = require('../services/businessDetailsService');
const obligations = require('../services/obligationsService');
const propertyBusiness = require('../services/propertyBusinessService');

const showDashboardPage = asyncHandler(async(req, res) => {
  const nino = req.session.user?.nino;

  // Default tax year to current year
  const taxYear = utils.getCurrentTaxYear();

  // Check for eligible MTD status
  const mtdEligible = await saIndividualDetails.getMtdEligible({nino, taxYear, context: req.context});

  // Get UK property business ID
  const businessId = await businessDetails.getUkPropertyBusinessId({nino, context: req.context});

  // Get obligations
  const obligationsData = await obligations.getObligations({nino, session: req.session});
  
  // Set session details
  req.session.user.nino = nino;
  req.session.user.ukPropertyBusinessId = businessId;

  // Get a UK property cumulative summary
  const cumulativeData = await propertyBusiness.getUkPropertyCumulativeSummary({
    nino,
    businessId,
    taxYear,
    context: req.context
  });

  res.render('dashboard', {
    itsaStatus: mtdEligible,
    propertyRegistered: businessId !== null && businessId !== undefined,
    obligationsData: obligationsData.body,
    cumulativeData: cumulativeData.body
  });
});

module.exports = { showDashboardPage };