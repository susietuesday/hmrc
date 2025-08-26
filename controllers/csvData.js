const asyncHandler = require('express-async-handler');
const { processCsvIncomeFile, processCsvExpensesFile } = require('../services/csvDataService');

const uploadCsvIncomeFile = asyncHandler(async (req, res) => {
  // Check if file is provided
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { results, income } = await processCsvIncomeFile(req.file.buffer);

  // Save cumulative totals to session
  req.session.user.summary.ukProperty.income = income;

  res.json({
    message: 'CSV parsed successfully',
    data: {
      results
    }
  });
});

const uploadCsvExpensesFile = asyncHandler(async (req, res) => {
  // Check if file is provided
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { results, expenses } = await processCsvExpensesFile(req.file.buffer);

  // Save cumulative totals to session
  req.session.user.summary.ukProperty.expenses = expenses;

  res.json({
    message: 'CSV parsed successfully',
    data: {
      results
    }
  });
});

module.exports = {
  uploadCsvIncomeFile,
  uploadCsvExpensesFile
};