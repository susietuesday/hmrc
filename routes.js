const express = require('express');
const router = express.Router();

// Middleware and utility functions
const { requireUser } = require('./middleware.js');
const { uploadCsvFile } = require('./controllers/csvData.js');


const multer = require('multer');
const path = require('path');
const storage = multer.memoryStorage(); // or diskStorage if you prefer
const upload = multer({ storage });

const streamifier = require('streamifier');
const csv = require('csv-parser');

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

const { getItsaStatus } = require('./controllers/saIndividualDetails.js');
const { getIncomeAndExpenditureObligations } = require('./controllers/obligations.js');
const { getBusinessList } = require('./controllers/businessDetails.js');
const { postUkPropertyPeriodSummary } = require('./controllers/propertyBusiness.js');

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
router.get('/itsa-status', requireUser, getItsaStatus);
router.get('/obligations', requireUser, getIncomeAndExpenditureObligations);
router.get('/business-sources', requireUser, getBusinessList);
router.post('/periodic-summary', requireUser, postUkPropertyPeriodSummary);

// POST /upload
router.post('/upload', upload.single('csvFile'), uploadCsvFile);

module.exports = router;
