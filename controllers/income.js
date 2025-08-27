const asyncHandler = require('express-async-handler');
const schemaMappings = require('../config/schemaMappings.js');
const { getIncomeCategory, getIncomeDescription } = require('../shared/schema.js');

const showIncomePage = asyncHandler(async(req, res) => {
  res.render('income', {
    incomeCategories: schemaMappings.INCOME_CATEGORIES,
    getCategory: getIncomeCategory,
    getDescription: getIncomeDescription
  });
});

module.exports = { showIncomePage };