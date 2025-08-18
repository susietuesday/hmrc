const propertyBusinessRepo = require('../repositories/propertyBusinessRepo.js');

async function createUkPropertyPeriodSummary({ nino, businessId, taxYear, session }) {
  const data = {
    "fromDate": "2024-04-06",
    "toDate": "2024-07-05",
    "ukFhlProperty": {
        "income": {
        "periodAmount": 5000.99,
        "taxDeducted": 3123.21,
        "rentARoom": {
            "rentsReceived": 532.12
        }
        },
        "expenses": {
        "consolidatedExpenses": 988.18,
        "rentARoom": {
            "amountClaimed": 3000.87
        }
        }
    },
    "ukNonFhlProperty": {
        "income": {
        "premiumsOfLeaseGrant": 42.12,
        "reversePremiums": 84.31,
        "periodAmount": 9884.93,
        "taxDeducted": 842.99,
        "otherIncome": 31.44,
        "rentARoom": {
            "rentsReceived": 947.66
        }
        },
        "expenses": {
        "consolidatedExpenses": 988.18,
        "residentialFinancialCost": 988.18,
        "residentialFinancialCostsCarriedForward": 302.23,
        "rentARoom": {
            "amountClaimed": 952.53
        }
        }
    }
  }

  const response = await propertyBusinessRepo.createUkPropertyPeriodSummary({
    nino,
    businessId,
    taxYear,
    body: data,
    session
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
  createUkPropertyPeriodSummary,
  getUkPropertyCumulativeSummary
};