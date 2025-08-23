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

  let mtdEligible;
  try {
    // Check for eligible MTD status
    mtdEligible = await saIndividualDetails.getMtdEligible({nino, taxYear, session: req.session});
    } 
    catch (error) {
      res.render('index', { error: error.message });
      return;
  };

  // Get UK property business ID
  const businessId = await businessDetails.getUkPropertyBusinessId({nino, session: req.session});

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
    session: req.session
  });

  res.render('dashboard', {
    itsaStatus: mtdEligible,
    propertyRegistered: businessId !== null && businessId !== undefined,
    obligationsData: obligationsData.body,
    cumulativeData: cumulativeData.body
  });
});

module.exports = { showDashboardPage };