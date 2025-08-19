const asyncHandler = require('express-async-handler');

const showIncomePage = asyncHandler(async(req, res) => {
  res.render('income');
});

module.exports = { showIncomePage };