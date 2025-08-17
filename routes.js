const express = require('express');
const router = express.Router();

// Middleware and utility functions
const { requireUser } = require('./middleware.js');
const { uploadCsvFile } = require('./controllers/csvData.js');

const multer = require('multer');
const storage = multer.memoryStorage(); // or diskStorage if you prefer
const upload = multer({ storage });

// Route handlers
const testSupport = require('./controllers/testSupport.js');
const { getItsaStatus } = require('./controllers/saIndividualDetails.js');
const { runAllStatusChecks } = require('./controllers/statusChecks.js');
const { getIncomeAndExpenditureObligations } = require('./controllers/obligations.js');
const { getBusinessList } = require('./controllers/businessDetails.js');
const { postUkPropertyPeriodSummary } = require('./controllers/propertyBusiness.js');

// MTD sandbox routes
router.get('/unrestrictedCall', testSupport.getHelloWorld);
router.get('/applicationCall', testSupport.getHelloApplication);
router.get('/userCall', requireUser, testSupport.getHelloUser);
router.get('/fraud-headers', testSupport.validateFraudPreventionHeaders);
router.get('/services', testSupport.getServices);
router.post('/test-users', testSupport.postTestUser);
router.post('/itsa-status', requireUser, testSupport.postTestItsaStatus);
router.post('/test/uk-property-business', requireUser, testSupport.postTestUkPropertyBusiness);

// MTD production routes
router.get('/itsa-status', requireUser, getItsaStatus);
router.get('/dashboard', requireUser, runAllStatusChecks);
router.get('/business-sources', requireUser, getBusinessList);
router.get('/obligations', requireUser, getIncomeAndExpenditureObligations);
router.post('/property-income', upload.single('csv'), uploadCsvFile);
router.post('/periodic-summary', requireUser, postUkPropertyPeriodSummary);

router.post('/upload', upload.single('csvFile'), uploadCsvFile);

/*
router.post('/property-income', upload.single('csv'), async (req, res) => {
  try {
    const csvBuffer = req.file.buffer;
    const parsedTransactions = parseCsvBuffer(csvBuffer); // your CSV parser
    res.json(parsedTransactions); // send parsed data back to front-end
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse CSV' });
  }
});
*/

module.exports = router;
