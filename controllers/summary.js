const asyncHandler = require('express-async-handler');
const utils = require('../utils/utils');

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

module.exports = { showSummaryPage };