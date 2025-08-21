const { 
  parseCsvBuffer
} = require('../utils/dataUtils.js');

const utils = require('../utils/utils.js');

async function processCsvIncomeFile(fileBuffer) {

  // Parsing logic
  const requiredColumns = ['Date Received', 'Amount'];
  const results = await parseCsvBuffer(fileBuffer, requiredColumns);

  // Calculate total amount
  const periodAmount = calculateTotalAmount(results, 'Amount');

  return {
    results,
    periodAmount
  };
};

async function processCsvExpensesFile(fileBuffer) {

  // Parsing logic
  const requiredColumns = ['Payment Date', 'Amount'];
  const results = await parseCsvBuffer(fileBuffer, requiredColumns);

  // Calculate total amount
  const consolidatedExpenses = calculateTotalAmount(results, 'Amount');

  return {
    results,
    consolidatedExpenses
  };
};

function calculateTotalAmount(rows, amountColumn = 'Amount') {
  const totalPence = rows.reduce((sum, row) => {
    return sum + utils.parseCurrencyToPence(row?.[amountColumn]);
  }, 0);

  // Return pounds as a number with 2dp
  return (totalPence / 100);
  // or as a formatted string: return (totalPence / 100).toFixed(2);
}

module.exports = {
  processCsvIncomeFile,
  processCsvExpensesFile
};