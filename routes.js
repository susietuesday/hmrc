const express = require('express');
const router = express.Router();

// Middleware and utility functions
const { requireUser } = require('./middleware.js');

// Route handlers
const {
  testServices,
  fetchHello,
  validateFraudPreventionHeaders,
  createTestUser,
  createTestItsaStatus,
  fetchServices,
  createTestUkPropertyBusiness
} = require('./routes/test');

const { fetchItsaStatus } = require('./routes/selfAssessmentIndividualDetails');
const { fetchIncomeAndExpenditureObligations } = require('./routes/obligations.js');
const { fetchBusinessList } = require('./routes/businessDetails');
const { createUkPropertyPeriodSummary } = require('./routes/propertyBusiness');

// MTD sandbox routes
router.get('/unrestrictedCall', fetchHello(testServices.hello.routes.world));
router.get('/applicationCall', fetchHello(testServices.hello.routes.application));
router.get('/userCall', requireUser, fetchHello(testServices.hello.routes.user));
router.get('/fraud-headers', validateFraudPreventionHeaders);
router.get('/services', fetchServices);
router.post('/test-users', createTestUser);
router.post('/itsa-status', requireUser, createTestItsaStatus);
router.post('/test/uk-property-business', requireUser, createTestUkPropertyBusiness);

// MTD production routes
router.get('/itsa-status', requireUser, fetchItsaStatus);
router.get('/obligations', requireUser, fetchIncomeAndExpenditureObligations);
router.get('/business-sources', requireUser, fetchBusinessList);
router.post('/periodic-summary', requireUser, createUkPropertyPeriodSummary);

module.exports = router;
