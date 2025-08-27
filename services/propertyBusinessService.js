const dataUtils = require('../utils/dataUtils.js');
const propertyBusinessRepo = require('../repositories/propertyBusinessRepo.js');

async function createUkPropertyCumulativeSummary({ nino, businessId, taxYear, body, context }) {
  const income = body.ukProperty.income;
  const expenses = body.ukProperty.expenses;

const data = {
  fromDate: body.fromDate,
  toDate: body.toDate,
  ukProperty: {
    income: {
      ...dataUtils.optionalProp(income.premiumsOfLeaseGrant, 'premiumsOfLeaseGrant'),
      ...dataUtils.optionalProp(income.reversePremiums, 'reversePremiums'),
      ...dataUtils.optionalProp(income.periodAmount, 'periodAmount'),
      ...dataUtils.optionalProp(income.taxDeducted, 'taxDeducted'),
      ...dataUtils.optionalProp(income.otherIncome, 'otherIncome'),
      ...dataUtils.optionalNested(
        income.rentARoom?.rentsReceived ? { rentsReceived: income.rentARoom.rentsReceived } : null,
        'rentARoom'
      )
    },
    expenses: {
      ...dataUtils.optionalProp(expenses.premisesRunningCosts, 'premisesRunningCosts'),
      ...dataUtils.optionalProp(expenses.repairsAndMaintenance, 'repairsAndMaintenance'),
      ...dataUtils.optionalProp(expenses.financialCosts, 'financialCosts'),
      ...dataUtils.optionalProp(expenses.professionalFees, 'professionalFees'),
      ...dataUtils.optionalProp(expenses.costOfServices, 'costOfServices'),
      ...dataUtils.optionalProp(expenses.other, 'other'),
      ...dataUtils.optionalProp(expenses.residentialFinancialCost, 'residentialFinancialCost'),
      ...dataUtils.optionalProp(expenses.travelCosts, 'travelCosts'),
      ...dataUtils.optionalProp(expenses.residentialFinancialCostsCarriedForward, 'residentialFinancialCostsCarriedForward'),
      ...dataUtils.optionalNested(
        expenses.rentARoom?.amountClaimed ? { amountClaimed: expenses.rentARoom.amountClaimed } : null,
        'rentARoom'
      ),
      ...dataUtils.optionalProp(expenses.consolidatedExpenses, 'consolidatedExpenses')
    }
  }
};

  const response = await propertyBusinessRepo.createUkPropertyCumulativeSummary({
    nino,
    businessId,
    taxYear,
    body: data,
    context
  });
  return response;
}

async function getUkPropertyCumulativeSummary({ nino, businessId, taxYear, session }) {

  const response = await propertyBusinessRepo.fetchUkPropertyCummulativeSummary({
    nino,
    businessId,
    taxYear,
    session
  });
  return response;
}

module.exports = {
  getUkPropertyCumulativeSummary,
  createUkPropertyCumulativeSummary
};