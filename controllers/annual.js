const asyncHandler = require('express-async-handler');

const showAnnualPage = asyncHandler(async(req, res) => {

  res.render("annual");
});

module.exports = { 
  showAnnualPage
};