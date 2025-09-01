const streamifier = require('streamifier');
const csv = require('csv-parser');
const { 
  parseCsvBuffer
} = require('../utils/dataUtils.js');

const utils = require('../utils/utils.js');
const { INCOME_CATEGORIES, EXPENSE_CATEGORIES} = require('../config/schemaMappings.js')

async function extractTotalsFromBuffer(buffer) {
  const totals = { income: {}, expenses: {} };
  let section = null;

  const stream = streamifier.createReadStream(buffer).pipe(csv({ headers: false, skipEmptyLines: true }));

  for await (const row of stream) {
    const [first, second] = Object.values(row);

    // Detect section
  if (first === 'Income') {
      section = 'income';
      continue;
    } else if (first === 'Expenses') {
      section = 'expenses';
      continue;
    }

    // Parse item rows
    const item = first;
    const amount = parseFloat(second);
    if (section && item && !isNaN(amount)) {
      totals[section][item] = amount;
    }
  }

  const ukProperty = mapCsvTotalsToUkProperty(totals);

  return {
    ukProperty
  };
};

function mapCsvTotalsToUkProperty(totals) {
  const ukProperty = {
    income: {},
    expenses: {}
  };

  // Map income
  for (const { key, category } of INCOME_CATEGORIES) {
    const value = totals.income?.[category];
    if (value == null) continue; // skip if missing

    const parsedValue = parseFloat(value.toFixed(2));

    if (key.startsWith('rentARoom.')) {
      const subKey = key.split('.')[1];
      if (!ukProperty.income.rentARoom) {
        ukProperty.income.rentARoom = {};
      }
      ukProperty.income.rentARoom[subKey] = parsedValue;
    } else {
      ukProperty.income[key] = parsedValue;
    }
  }

  // Map expenses
  for (const { key, category } of EXPENSE_CATEGORIES) {
    const value = totals.expenses?.[category];
    if (value == null) continue;

    const parsedValue = parseFloat(value.toFixed(2));

    if (key.startsWith('rentARoom.')) {
      const subKey = key.split('.')[1];
      if (!ukProperty.expenses.rentARoom) {
        ukProperty.expenses.rentARoom = {};
      }
      ukProperty.expenses.rentARoom[subKey] = parsedValue;
    } else {
      ukProperty.expenses[key] = parsedValue;
    }
  }

  return ukProperty;
}

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

async function processCsvExpensesFile(fileBuffer) {

  // Parsing logic
  const requiredColumns = ['Date', 'Amount', 'Category'];
  const results = await parseCsvBuffer(fileBuffer, requiredColumns);

  // Calculate total amount
  const totals = sumCsvByCategory(results);
  const expenses = mapPropertyExpenses(totals);

  return {
    results,
    expenses
  };
};

function mapPropertyIncome(totals) {
  const MAX_VALUE = 99999999999.99;

  const getValue = (key) => {
    const val = parseFloat(totals[key]);
    if (isNaN(val)) return null;
    const rounded = Math.round(val * 100) / 100;
    if (rounded === 0) return null;
    return Math.min(MAX_VALUE, rounded);
  };

  const income = {};

  const addIfNotNull = (field, key) => {
    const value = getValue(key);
    if (value !== null) {
      income[field] = value;
    }
  };

  addIfNotNull("premiumsOfLeaseGrant", "Lease Premium");
  addIfNotNull("reversePremiums", "Reverse Premium");
  addIfNotNull("periodAmount", "Rent");
  addIfNotNull("taxDeducted", "Tax Deducted");
  addIfNotNull("otherIncome", "Other Property Income");

  // rentARoom only if it has a value
  const rentARoomValue = getValue("Rent-a-Room");
  if (rentARoomValue !== null) {
    income.rentARoom = { rentsReceived: rentARoomValue };
  }

  return income;
}

function mapPropertyExpenses(totals) {
  const MAX_VALUE = 99999999999.99;
  const MIN_VALUE = -99999999999.99;
  const MIN_ZERO = 0;

  const getValue = (key, zeroOnly = false) => {
    const val = parseFloat(totals[key]);
    if (isNaN(val)) return null; // No value
    const rounded = Math.round(val * 100) / 100;
    if (rounded === 0) return null; // Exclude zeros
    if (zeroOnly) {
      return Math.min(MAX_VALUE, Math.max(MIN_ZERO, rounded));
    } else {
      return Math.min(MAX_VALUE, Math.max(MIN_VALUE, rounded));
    }
  };

  const expenses = {};

  const addIfNotNull = (field, key, zeroOnly = false) => {
    const value = getValue(key, zeroOnly);
    if (value !== null) {
      expenses[field] = value;
    }
  };

  addIfNotNull("premisesRunningCosts", "Premises Running Costs");
  addIfNotNull("repairsAndMaintenance", "Repairs and Maintenance");
  addIfNotNull("financialCosts", "Financial Costs");
  addIfNotNull("professionalFees", "Professional Fees");
  addIfNotNull("costOfServices", "Cost of Services");
  addIfNotNull("other", "Other Expenses");
  addIfNotNull("residentialFinancialCost", "Residential Financial Cost", true);
  addIfNotNull("travelCosts", "Travel Costs");
  addIfNotNull("residentialFinancialCostsCarriedForward", "Residential Financial Costs Carried Forward", true);
  addIfNotNull("consolidatedExpenses", "Consolidated Expenses");

  // Special handling for rentARoom because it's an object
  const rentARoomValue = getValue("Rent-a-Room Deduction", true);
  if (rentARoomValue !== null) {
    expenses.rentARoom = { amountClaimed: rentARoomValue };
  }

  return expenses;
}


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

module.exports = {
  processCsvIncomeFile,
  processCsvExpensesFile,
  extractTotalsFromBuffer
};