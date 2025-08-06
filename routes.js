const express = require('express');
const router = express.Router();

// Middleware and utility functions
const { requireUser } = require('./middleware.js');

// Route handlers
const {
  getHelloWorld,
  getHelloApplication,
  getHelloUser,
  validateFraudPreventionHeaders,
  postTestUser,
  postTestItsaStatus,
  getServices,
  postTestUkPropertyBusiness
} = require('./controllers/testSupport.js');

const { fetchItsaStatus } = require('./controllers/selfAssessmentIndividualDetails.js');
const { fetchIncomeAndExpenditureObligations } = require('./controllers/obligations.js');
const { fetchBusinessList } = require('./controllers/businessDetails.js');
const { createUkPropertyPeriodSummary } = require('./controllers/propertyBusiness.js');

// MTD sandbox routes
router.get('/unrestrictedCall', getHelloWorld);
router.get('/applicationCall', getHelloApplication);
router.get('/userCall', requireUser, getHelloUser);
router.get('/fraud-headers', validateFraudPreventionHeaders);
router.get('/services', getServices);
router.post('/test-users', postTestUser);
router.post('/itsa-status', requireUser, postTestItsaStatus);
router.post('/test/uk-property-business', requireUser, postTestUkPropertyBusiness);

// MTD production routes
router.get('/itsa-status', requireUser, fetchItsaStatus);
router.get('/obligations', requireUser, fetchIncomeAndExpenditureObligations);
router.get('/business-sources', requireUser, fetchBusinessList);
router.post('/periodic-summary', requireUser, createUkPropertyPeriodSummary);

module.exports = router;
