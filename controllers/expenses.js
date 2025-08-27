const asyncHandler = require('express-async-handler');
const schemaMappings = require('../config/schemaMappings.js');
const { getExpenseCategory, getExpenseDescription } = require('../shared/schema.js');

const showExpensesPage = asyncHandler(async(req, res) => {
  res.render('expenses', {
    expenseCategories: schemaMappings.EXPENSE_CATEGORIES,
    getCategory: getExpenseCategory,
    getDescription: getExpenseDescription
  });
});

module.exports = { showExpensesPage };