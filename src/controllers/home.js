const asyncHandler = require('express-async-handler');
const utils = require('../utils/utils.js');

const validateNino = asyncHandler(async(req, res) => {
  const nino = req.body.nino;

  if (!nino || !utils.validateNino(nino)) {
    return res.render('index', { error: 'Invalid National Insurance number format.' });
  }

  // Normalize NINO to uppercase and store in session
  req.session.user = {
    ...req.session.user,
    nino: nino.toUpperCase()
  };

  res.redirect('/dashboard');
});

module.exports = { validateNino };