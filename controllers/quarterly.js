const asyncHandler = require('express-async-handler');
const utils = require('../utils/utils.js');
const propertyBusinessService = require('../services/propertyBusinessService.js');
const schemaMappings = require('../config/schemaMappings.js');
const schema = require('../shared/schema.js');

const MESSAGES = {
  RULE_BOTH_EXPENSES_SUPPLIED: `You can't include both consolidated expenses and individual expense categories in the same update. Please choose either consolidated expenses or break down your expenses into individual categories, not both.`
};

const showSummaryPage = asyncHandler(async(req, res) => {

  // Set default dates
  req.session.user.summary.fromDate = utils.getCurrentTaxYearStart();
  req.session.user.summary.toDate = utils.getTodayDate();

  const summary = req.session.user.summary;
  const defaultToDate = utils.addDays(summary.toDate, 10);

  res.render("quarterly", {
    income: summary.ukProperty.income,
    expenses: summary.ukProperty.expenses,
    fromDate: summary.fromDate,
    toDate: summary.toDate,
    defaultToDate: defaultToDate,
    incomeCategories: schemaMappings.INCOME_CATEGORIES,
    getIncomeCategory: schema.getIncomeCategory,
    getIncomeDescription: schema.getIncomeDescription,
    getExpensesCategory: schema.getExpenseCategory,
    getExpensesDescription: schema.getExpenseDescription
  });
});

const submitSummary = asyncHandler(async(req, res) => {
  const nino = req.session.user.nino;
  const businessId = req.session.user.ukPropertyBusinessId;
  const taxYear = utils.getCurrentTaxYear();

  const apiResponse = await propertyBusinessService.createUkPropertyCumulativeSummary({
    nino,
    businessId,
    taxYear,
    body: req.session.user.summary,
    context: req.context
  });

  // Check for error
  if (apiResponse.status !== 200) {
    req.session.error = MESSAGES.RULE_BOTH_EXPENSES_SUPPLIED;
    return;
  }

  // Set x-correlationid
  req.session.user.summary.correlationId = apiResponse.xCorrelationId;

  return res.redirect('/quarterly');
});

module.exports = { 
  showSummaryPage,
  submitSummary
};