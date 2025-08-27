const asyncHandler = require('express-async-handler');
const utils = require('../utils/utils');

const saIndividualDetails = require('../services/saIndividualDetailsService');
const businessDetails = require('../services/businessDetailsService');
const obligations = require('../services/obligationsService');
const propertyBusiness = require('../services/propertyBusinessService');
const schemaMappings = require('../config/schemaMappings.js');
const schema = require('../shared/schema.js');

const MESSAGES = {
  NOT_FOUND: `We couldn't find any UK property details registered for your account.\n\nIf you believe this is an error, please check your HMRC account or contact HMRC support.`
};

const showDashboardPage = asyncHandler(async(req, res) => {
  const nino = req.session.user?.nino;
  const context = req.context

  // Default tax year to current year
  const taxYear = utils.getCurrentTaxYear();

  // Check for eligible MTD status
  const mtdEligible = await saIndividualDetails.getMtdEligible({nino, taxYear, context});

  if (!mtdEligible.success) {
    req.session.error = mtdEligible.message;
    return res.redirect('/');
  }

  // Get UK property business ID
  const businessId = await businessDetails.getUkPropertyBusinessId({nino, context});

  if (!businessId) {
    req.session.error = MESSAGES.NOT_FOUND
    return res.redirect('/');
  }

  // Get obligations
  const obligationsData = await obligations.getObligations({nino, context});
  
  // Set session details
  req.session.user.nino = nino;
  req.session.user.ukPropertyBusinessId = businessId;

  // Get a UK property cumulative summary
  const cumulativeData = await propertyBusiness.getUkPropertyCumulativeSummary({
    nino,
    businessId,
    taxYear,
    context
  });

  res.render('dashboard', {
    obligationsData: obligationsData.body,
    cumulativeData: cumulativeData.body,
    incomeCategories: schemaMappings.INCOME_CATEGORIES,
    getIncomeCategory: schema.getIncomeCategory,
    getIncomeDescription: schema.getIncomeDescription,
    getExpensesCategory: schema.getExpenseCategory,
    getExpensesDescription: schema.getExpenseDescription
  });
});

module.exports = { showDashboardPage };