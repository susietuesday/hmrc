const {
  getCell,
  addValue,
  readBuffer
} = require('../utils/dataUtils.js');

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

module.exports = {
  extractCsvQuarterlyData,
  extractCsvAnnualData
};