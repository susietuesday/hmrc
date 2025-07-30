const asyncHandler = require('express-async-handler');
const { log, callApi, getUserRestrictedToken } = require('../utils');

const businessDetailsServices = {
  businessDetails: {
    name: 'individuals/business/details',
    version: '1.0',
    routes: {
      listByNino: (nino) => `/${encodeURIComponent(nino)}/list`
    }
  }
};

const fetchBusinessList = asyncHandler(async (req, res) => {

  const nino = req.query.nino;

  if (!nino) {
    return res.status(400).send("Missing NINO in query string");
  }

  const accessToken = await getUserRestrictedToken(req, res);

  const serviceName = hmrcServices.businessDetails.name;
  const routePath = hmrcServices.businessDetails.routes.listByNino(nino);
  const serviceVersion = hmrcServices.businessDetails.version;

  const apiResponse = await callApi({
    method: 'GET',
    serviceName: serviceName,
    routePath: routePath,
    serviceVersion: serviceVersion,
    bearerToken: accessToken,
    extraHeaders: {'Gov-Test-Scenario': 'PROPERTY'}
  });

  res.status(apiResponse.status).json(apiResponse.body);

});

module.exports = {
    fetchBusinessList
};
