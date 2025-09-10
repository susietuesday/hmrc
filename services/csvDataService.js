const streamifier = require('streamifier');
const csv = require('csv-parser');
const { 
  parseCsvBuffer,
  getCell,
  addValue,
  readBuffer
} = require('../utils/dataUtils.js');

const utils = require('../utils/utils.js');
const { INCOME_CATEGORIES, EXPENSE_CATEGORIES} = require('../config/schemaMappings.js')

async function extractCsvQuarterlyData(buffer) {
  const results = await readBuffer(buffer);

  const ukProperty = { income: {}, expenses: {} };

  // Income
  addValue(ukProperty.income, 'periodAmount', getCell(results, 'D6'));
  addValue(ukProperty.income, 'premiumsOfLeaseGrant', getCell(results, 'D8'));
  addValue(ukProperty.income, 'reversePremiums', getCell(results, 'D10'));
  addValue(ukProperty.income, 'otherIncome', getCell(results, 'D12'));
  addValue(ukProperty.income, 'taxDeducted', getCell(results, 'D14'));
  addValue(ukProperty.income, 'rentARoom.rentsReceived', getCell(results, 'D16'));

  // Expenses
  addValue(ukProperty.expenses, 'consolidatedExpenses', getCell(results, 'D20'));
  addValue(ukProperty.expenses, 'premisesRunningCosts', getCell(results, 'D22'));
  addValue(ukProperty.expenses, 'repairsAndMaintenance', getCell(results, 'D24'));
  addValue(ukProperty.expenses, 'financialCosts', getCell(results, 'D26'));
  addValue(ukProperty.expenses, 'professionalFees', getCell(results, 'D28'));
  addValue(ukProperty.expenses, 'costOfServices', getCell(results, 'D30'));
  addValue(ukProperty.expenses, 'other', getCell(results, 'D32'));
  addValue(ukProperty.expenses, 'residentialFinancialCost', getCell(results, 'D34'), true);
  addValue(ukProperty.expenses, 'residentialFinancialCostsCarriedForward', getCell(results, 'D36'), true);
  addValue(ukProperty.expenses, 'travelCosts', getCell(results, 'D38'));
  addValue(ukProperty.expenses, 'rentARoom.amountClaimed', getCell(results, 'D40'), true);

  return ukProperty;
};

async function extractCsvAnnualData(buffer) {
  const results = await readBuffer(buffer);

  const ukProperty = { adjustments: {}, allowances: {} };

  // Adjustments
  addValue(ukProperty.adjustments, 'balancingCharge', getCell(results, 'D10'));
  addValue(ukProperty.adjustments, 'privateUseAdjustment', getCell(results, 'D12'));
  addValue(ukProperty.adjustments, 'businessPremisesRenovationAllowanceBalancingCharges', getCell(results, 'D26'));
  addValue(ukProperty.adjustments, 'nonResidentLandlord', getCell(results, 'D14'));
  addValue(ukProperty.adjustments, 'rentARoom.jointlyLet', getCell(results, 'D16'));

  // Allowances
  addValue(ukProperty.allowances, 'annualInvestmentAllowance', getCell(results, 'D18'));
  addValue(ukProperty.allowances, 'businessPremisesRenovationAllowance', getCell(results, 'D24'));
  addValue(ukProperty.allowances, 'otherCapitalAllowance', getCell(results, 'D20'));
  addValue(ukProperty.allowances, 'costOfReplacingDomesticItems', getCell(results, 'D6'));
  addValue(ukProperty.allowances, 'zeroEmissionsCarAllowance', getCell(results, 'D22'));
  addValue(ukProperty.allowances, 'propertyIncomeAllowance', getCell(results, 'D8'));

  // Structures and Buildings Allowance
  addValue(ukProperty.allowances, 'structuredBuildingAllowance.amount', getCell(results, 'D30'));
  addValue(ukProperty.allowances, 'structuredBuildingAllowance.firstYear.qualifyingDate', getCell(results, 'D32'));
  addValue(ukProperty.allowances, 'structuredBuildingAllowance.firstYear.qualifyingAmountExpenditure', getCell(results, 'D34'));
  addValue(ukProperty.allowances, 'structuredBuildingAllowance.building.name', getCell(results, 'D36'));
  addValue(ukProperty.allowances, 'structuredBuildingAllowance.building.number', getCell(results, 'D38'));
  addValue(ukProperty.allowances, 'structuredBuildingAllowance.building.postcode', getCell(results, 'D40'));

  // Enhanced Structures and Buidlings Allowance
  addValue(ukProperty.allowances, 'enhancedStructuredBuildingAllowance.amount', getCell(results, 'D44'));
  addValue(ukProperty.allowances, 'enhancedStructuredBuildingAllowance.firstYear.qualifyingDate', getCell(results, 'D46'));
  addValue(ukProperty.allowances, 'enhancedStructuredBuildingAllowance.firstYear.qualifyingAmountExpenditure', getCell(results, 'D48'));
  addValue(ukProperty.allowances, 'enhancedStructuredBuildingAllowance.building.name', getCell(results, 'D50'));
  addValue(ukProperty.allowances, 'enhancedStructuredBuildingAllowance.building.number', getCell(results, 'D52'));
  addValue(ukProperty.allowances, 'enhancedStructuredBuildingAllowance.building.postcode', getCell(results, 'D54'));

  return ukProperty;
};

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
  extractCsvQuarterlyData,
  extractCsvAnnualData
};