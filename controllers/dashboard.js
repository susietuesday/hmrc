const asyncHandler = require('express-async-handler');
const utils = require('../utils/utils');

const saIndividualDetails = require('../services/saIndividualDetailsService');
const businessDetails = require('../services/businessDetailsService');
const obligations = require('../services/obligationsService');
const schemaMappings = require('../config/schemaMappings.js');
const schema = require('../shared/schema.js');

const MESSAGES = {
  itsaStatus:{
    FORMAT_NINO: `Invalid National Insurance number format. Please check and try again.`,
    CLIENT_OR_AGENT_NOT_AUTHORISED: `The National Insurance number you entered does not match your HMRC account. Please try again.`,
    MATCHING_RESOURCE_NOT_FOUND: `We couldn't find a Self Assessment record for your National Insurance number.\n\nThis usually means you're not registered for Self Assessment.\nIf you think this is wrong, please check your details or contact HMRC.`
  },
  propertyDetails:{
    NOT_FOUND: `We couldn't find any UK property details registered for your account.\n\nIf you believe this is an error, please check your HMRC account or contact HMRC support.`
  },
  cumulativeSummary:{
    MATCHING_RESOURCE_NOT_FOUND: `We could't find any existing cumulative summary data.`
  }
};

const showDashboardPage = asyncHandler(async(req, res) => {
  const nino = req.session.user?.nino;
  const context = req.context

  // Default tax year to current year
  const taxYear = utils.getCurrentTaxYear();

  // Check for eligible MTD status
  const mtdEligible = await saIndividualDetails.getMtdEligible({nino, taxYear, context});

  if (!mtdEligible.success) {
    let message;
    switch (mtdEligible.code) {
      case 'FORMAT_NINO':
        message = MESSAGES.itsaStatus.FORMAT_NINO;
        break;
      case 'CLIENT_OR_AGENT_NOT_AUTHORISED':
        message = MESSAGES.itsaStatus.CLIENT_OR_AGENT_NOT_AUTHORISED;
        break;
      case 'MATCHING_RESOURCE_NOT_FOUND':
        message = MESSAGES.itsaStatus.MATCHING_RESOURCE_NOT_FOUND;
        break;
      default:
        throw new error(mtdEligible.code);
    };

    req.session.error = message;
    return res.redirect('/');
  }

  // Get UK property business ID
  const businessId = await businessDetails.getUkPropertyBusinessId({nino, context});

  if (!businessId) {
    req.session.error = MESSAGES.propertyBusiness.NOT_FOUND
    return res.redirect('/');
  }

  // Get obligations
  const obligationsData = await obligations.getObligations({nino, context});
  
  // Set session details
  req.session.user.nino = nino;
  req.session.user.ukPropertyBusinessId = businessId;

  // Set default dates
  req.session.user.summary.fromDate = utils.getCurrentTaxYearStart();
  req.session.user.summary.toDate = utils.getTodayDate();

  const summary = req.session.user.summary;
  const defaultToDate = utils.addDays(summary.toDate, 10);

  res.render('dashboard', {
    obligationsData: obligationsData.body,
    incomeCategories: schemaMappings.INCOME_CATEGORIES,
    getIncomeCategory: schema.getIncomeCategory,
    getIncomeDescription: schema.getIncomeDescription,
    getExpensesCategory: schema.getExpenseCategory,
    getExpensesDescription: schema.getExpenseDescription,
    fromDate: summary.fromDate,
    toDate: summary.toDate,
    defaultToDate: defaultToDate
  });
});

module.exports = { showDashboardPage };