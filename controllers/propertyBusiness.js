const asyncHandler = require('express-async-handler');

const { 
  log, 
  callApi,
  getUserRestrictedToken
} = require('../utils');

const services = {
  propertyBusiness: {
    name: 'individuals/business/property',
    version: '6.0',
    routes: {
      createUkPropertyPeriodSummary: (nino, businessId, taxYear) => `/uk/${encodeURIComponent(nino)}/${encodeURIComponent(businessId)}/period/${taxYear}`
    }
  }
};

const createUkPropertyPeriodSummary = asyncHandler(async (req, res) => {
  if (req.session.oauth2Token) {
 
    const nino = req.body.nino;
    const businessId = 'XBIS12345678901'
    const taxYear = '2024-25'

    if (!nino) {
      return res.status(400).send('NINO is required');
    }
    
    const serviceName = services.propertyBusiness.name;
    const serviceVersion = services.propertyBusiness.version;
    const routePath = services.propertyBusiness.routes.createUkPropertyPeriodSummary(nino, businessId, taxYear)

    const accessToken = await getUserRestrictedToken(req, res);
    
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

    const apiResponse = await callApi({
        method: 'POST',
        serviceName: serviceName,
        serviceVersion: serviceVersion,
        routePath: routePath,
        bearerToken: accessToken,
        extraHeaders: {'Gov-Test-Scenario': 'STATEFUL'},
        body: data
    });

    return res.status(apiResponse.status).json(apiResponse.body);

  } else {
    req.session.caller = '/periodic-summary';
    res.redirect(authorizationUri);
  }
});

module.exports = { 
  createUkPropertyPeriodSummary
};