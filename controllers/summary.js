const asyncHandler = require('express-async-handler');

const showSummaryPage = asyncHandler(async(req, res) => {
  res.render('summary');
});

module.exports = { showSummaryPage };