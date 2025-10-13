const asyncHandler = require('express-async-handler');

const showConfirmationPage = asyncHandler(async(req, res) => {
  const data = {
    fromDate: req.session.user.summary.fromDate,
    toDate: req.session.user.summary.toDate,
    correlationId: req.session.user.summary.correlationId
  };

  res.render('confirmation', { data });
});

module.exports = { showConfirmationPage };