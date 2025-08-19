const asyncHandler = require('express-async-handler');
const { processCsvIncomeFile } = require('../services/csvDataService');
const utils = require('../utils/utils');

const uploadCsvIncomeFile = asyncHandler(async (req, res) => {
  // Check if file is provided
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { results, totalAmount } = await processCsvIncomeFile(req.file.buffer);

  // Save cumulative totals to session
  req.session.user.summary.fromDate = utils.getCurrentTaxYearStart();
  req.session.user.summary.toDate = utils.getTodayDate();
  req.session.user.summary.ukProperty.income.periodAmount = totalAmount;

  res.json({
    message: 'CSV parsed successfully',
    data: {
      results
    }
  });
});

module.exports = {
  uploadCsvIncomeFile
};