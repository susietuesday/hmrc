const asyncHandler = require('express-async-handler');
const { processCsvIncomeFile, processCsvExpensesFile, extractTotalsFromBuffer, extractCsvAnnualData, extractCsvQuarterlyData } = require('../services/csvDataService');
const { INCOME_CATEGORIES, EXPENSE_CATEGORIES} = require('../config/schemaMappings.js')

const uploadCsvSummaryFile = asyncHandler(async (req, res) => {
  // Check if file is provided
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const ukProperty = await extractCsvQuarterlyData(req.file.buffer);
  console.log(JSON.stringify(ukProperty, null, 2));

  // Save cumulative totals to session
  req.session.user.summary.ukProperty = ukProperty;

  const mappedUkProperty = convertKeysToCategories(ukProperty);
  console.log(JSON.stringify(mappedUkProperty, null, 2));

  res.json({
    message: 'CSV parsed successfully',
    data: {
      mappedUkProperty
    }
  });
});

// Upload the annual update csv file
const uploadCsvAnnualFile = asyncHandler(async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const ukProperty = await extractCsvAnnualData(buffer);

    console.log('Extracted CSV Data:\n', JSON.stringify(ukProperty, null, 2));

    // Save to session
    req.session.user.annual.ukProperty = ukProperty;

    res.json(ukProperty);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function convertKeysToCategories(data) {
  const result = { income: {}, expenses: {} };

  // Helper: create lookup objects for faster access
  const incomeLookup = Object.fromEntries(INCOME_CATEGORIES.map(({ key, category }) => [key, category]));
  const expenseLookup = Object.fromEntries(EXPENSE_CATEGORIES.map(({ key, category }) => [key, category]));

  // Convert income keys
  for (const [key, value] of Object.entries(data.income)) {
    if (typeof value === 'object' && key === 'rentARoom') {
      result.income[incomeLookup['rentARoom.rentsReceived']] = value.rentsReceived;
    } else {
      const category = incomeLookup[key] || key;
      result.income[category] = value;
    }
  }

  // Convert expense keys
  for (const [key, value] of Object.entries(data.expenses)) {
    if (typeof value === 'object' && key === 'rentARoom') {
      result.expenses[expenseLookup['rentARoom.amountClaimed']] = value.amountClaimed;
    } else {
      const category = expenseLookup[key] || key;
      result.expenses[category] = value;
    }
  }

  return result;
}

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
  uploadCsvExpensesFile,
  uploadCsvSummaryFile,
  uploadCsvAnnualFile
};