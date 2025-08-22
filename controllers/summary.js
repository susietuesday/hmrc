const asyncHandler = require('express-async-handler');
const utils = require('../utils/utils');
const propertyBusinessService = require('../services/propertyBusinessService.js');

const showSummaryPage = asyncHandler(async(req, res) => {
  const summary = req.session.user.summary.ukProperty;

  // Set default dates
  req.session.user.summary.fromDate = utils.getCurrentTaxYearStart();
  req.session.user.summary.toDate = utils.getTodayDate();
  const defaultToDate = utils.addDays(summary.toDate, 10);

  res.render("summary", {
    income: summary.income,
    expenses: summary.expenses,
    fromDate: summary.fromDate,
    toDate: summary.toDate,
    defaultToDate: defaultToDate
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

  const correlationId = apiResponse.headers?.['x-correlationid'] || null;
  req.session.user.summary.correlationId = correlationId;

  return res.redirect('/confirmation');
});

module.exports = { 
  showSummaryPage,
  submitSummary
};