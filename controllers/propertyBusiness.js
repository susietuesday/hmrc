const asyncHandler = require('express-async-handler');

const { 
  createUkPropertyPeriodSummary
} = require('../services/propertyBusinessService.js');

const postUkPropertyPeriodSummary = asyncHandler(async (req, res) => { 
  const nino = req.body.nino;
  const businessId = 'XBIS12345678901'
  const taxYear = '2024-25'

  if (!nino) {
    return res.status(400).send('NINO is required');
  }
  
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

  const apiResponse = await createUkPropertyPeriodSummary(req, nino, businessId, taxYear, data);
  return res.status(apiResponse.status).json(apiResponse.body);
});

module.exports = { 
  postUkPropertyPeriodSummary
};