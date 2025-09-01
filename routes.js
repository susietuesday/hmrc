const express = require('express');
const router = express.Router();

// Middleware and utility functions
const { requireUser, attachContext } = require('./middleware.js');
router.use(attachContext);

const multer = require('multer');
const storage = multer.memoryStorage(); // or diskStorage if you prefer
const upload = multer({ storage });

// Route handlers
const home = require('./controllers/home.js');
const devTools = require('./controllers/devTools.js');
const csvData = require('./controllers/csvData.js');
const { getItsaStatus } = require('./controllers/saIndividualDetails.js');
const { showDashboardPage } = require('./controllers/dashboard.js');
const { getObligations } = require('./controllers/obligations.js');
const { getBusinessList } = require('./controllers/businessDetails.js');
const { getUkPropertyCumulativeSummary } = require('./controllers/propertyBusiness.js');
const income = require('./controllers/income.js');
const expenses = require('./controllers/expenses.js');
const summary = require('./controllers/quarterly.js');
const confirmation = require('./controllers/confirmation.js');

// Dev tools routes
router.get('/dev-tools', devTools.showDevToolsPage);
router.get('/unrestrictedCall', devTools.getHelloWorld);
router.get('/applicationCall', devTools.getHelloApplication);
router.get('/userCall', requireUser, devTools.getHelloUser);
router.get('/fraud-headers', devTools.validateFraudPreventionHeaders);
router.get('/services', devTools.getServices);
router.post('/test-users', devTools.postTestUser);
router.post('/itsa-status', requireUser, devTools.postTestItsaStatus);
router.post('/test/uk-property-business', requireUser, devTools.postTestUkPropertyBusiness);

// MTD production routes
router.post('/nino', home.validateNino);
router.get('/itsa-status', requireUser, getItsaStatus);
router.get('/dashboard', requireUser, showDashboardPage);
router.get('/business-sources', requireUser, getBusinessList);
router.get('/obligations', requireUser, getObligations);
router.post('/property-income', upload.single('csv'), csvData.uploadCsvIncomeFile);
router.post('/property-expenses', upload.single('csv'), csvData.uploadCsvExpensesFile);
router.post('/property-summary', upload.single('csv'), csvData.uploadCsvSummaryFile);
router.get('/cumulative-summary', requireUser, getUkPropertyCumulativeSummary);
router.get('/income', income.showIncomePage);
router.get('/expenses', expenses.showExpensesPage);
router.get('/quarterly', summary.showSummaryPage)
router.get('/summary', summary.showSummaryPage);
router.post('/summary', requireUser, attachContext, summary.submitSummary);
router.get('/confirmation', confirmation.showConfirmationPage);

router.post('/upload', upload.single('csvFile'), csvData.uploadCsvIncomeFile);

module.exports = router;
