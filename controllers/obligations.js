const asyncHandler = require('express-async-handler');
const obligationsService = require('../services/obligationsService');

const getObligations = asyncHandler(async(req, res) => {
  const nino = req.query.nino;
  if (!nino) {
    return res.status(400).json({ error: 'Missing NINO in query string' });
  }

  const apiResponse = await obligationsService.getObligations({
    nino, 
    context: req.context
  });

  return res.status(apiResponse.status).json(apiResponse.body);
})

module.exports = { 
  getObligations
};