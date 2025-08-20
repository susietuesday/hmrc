const asyncHandler = require('express-async-handler');

const showExpensesPage = asyncHandler(async(req, res) => {
  res.render('expenses');
});

module.exports = { showExpensesPage };