const asyncHandler = require('express-async-handler');

const { 
  log, 
  callApi 
} = require('../utils');

const hmrcServices = {
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
 
    const accessToken = client.createToken(req.session.oauth2Token);
    const nino = req.body.nino;
    const businessId = 'XBIS12345678901'
    const taxYear = '2024-25'

    if (!nino) {
      return res.status(400).send('NINO is required');
    }

    serviceName = 'individuals'
    serviceVersion = '6.0'
    const routePath = `/business/property/uk/${encodeURIComponent(nino)}/${encodeURIComponent(businessId)}/period/${encodeURIComponent(taxYear)}`;
    
    //Log scope
    log.info(`ℹ️ Scope: ${accessToken.token.scope}`);
    log.info('ℹ️ Url: ', routePath);
    
    callApi({
      bearerToken: accessToken,
      serviceVersion,
      serviceName,
      routePath: routePath
    });

  } else {
    req.session.caller = '/periodic-summary';
    res.redirect(authorizationUri);
  }
});

module.exports = { 
  createUkPropertyPeriodSummary
};