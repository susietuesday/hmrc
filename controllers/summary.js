const asyncHandler = require('express-async-handler');

const showSummaryPage = asyncHandler(async(req, res) => {
  const summary = req.session.user.summary.ukProperty;

  res.render("summary", {
    income: summary.income,
    expenses: summary.expenses
  });
});

module.exports = { showSummaryPage };