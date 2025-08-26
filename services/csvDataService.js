const { 
  parseCsvBuffer
} = require('../utils/dataUtils.js');

const utils = require('../utils/utils.js');

async function processCsvIncomeFile(fileBuffer) {

  // Parsing logic
  const requiredColumns = ['Date', 'Amount', 'Category'];
  const results = await parseCsvBuffer(fileBuffer, requiredColumns);

  const totals = sumCsvByCategory(results);
  const income = mapPropertyIncome(totals);
  
  return {
    results,
    income
  };
};

function mapPropertyIncome(totals) {
  // HMRC maximum value
  const MAX_VALUE = 99999999999.99;

  // Helper to safely get a number with 2 decimal places, capped at MAX_VALUE
  const getValue = (key) => {
    const val = parseFloat(totals[key]) || 0;
    return Math.min(MAX_VALUE, Math.round(val * 100) / 100);
  };

  const income = {
    premiumsOfLeaseGrant: getValue("Lease Premium"),
    reversePremiums: getValue("Reverse Premium"),
    periodAmount: getValue("Rent"),
    taxDeducted: getValue("Tax Deducted"),
    otherIncome: getValue("Other Property Income"),
    rentARoom: {
      rentsReceived: getValue("Rent-a-Room")
    }
  };

  return income;
}

async function processCsvExpensesFile(fileBuffer) {

  // Parsing logic
  const requiredColumns = ['Date', 'Amount', 'Category'];
  const results = await parseCsvBuffer(fileBuffer, requiredColumns);

  // Calculate total amount
  const consolidatedExpenses = calculateTotalAmount(results, 'Amount');

  return {
    results,
    consolidatedExpenses
  };
};

function sumCsvByCategory(results) {
  if (!results || results.length === 0) return {};

  const firstRow = results[0];
  const hasCategory = 'Category' in firstRow || 'category' in firstRow;

  const totals = {};

  for (const row of results) {
    const amount = utils.parseAmount(row.Amount || row.amount);
    if (isNaN(amount)) continue;

    if (hasCategory) {
      const category = (row.Category || row.category || 'Uncategorized').trim();
      totals[category] = Math.round(((totals[category] || 0) + amount) * 100) / 100;
    } else {
      totals['Rent'] = Math.round(((totals['Rent'] || 0) + amount) * 100) / 100;
    }
  }

  return totals;
}

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