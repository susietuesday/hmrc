const asyncHandler = require('express-async-handler');
const { processCsvFile } = require('../services/csvDataService');

const uploadCsvIncomeFile = asyncHandler(async (req, res) => {
  // Check if file is provided
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { results, quarterlyTotals } = await processCsvFile(req.file.buffer);

  res.json({
    message: 'CSV parsed successfully',
    data: {
      results,
      quarterlyTotals
    }
  });
});

module.exports = {
  uploadCsvIncomeFile
};