const asyncHandler = require('express-async-handler');
const utils = require('../utils/utils');
const saIndividualDetailsService = require('../services/saIndividualDetailsService');

const getItsaStatus = asyncHandler(async(req, res) => {
  // Get query parameters
  const nino = req.query.nino;
  let taxYear = req.query.taxYear;

  // Default to current tax year
  if (!taxYear) { taxYear = utils.getCurrentTaxYear()};

  // Get ITSA status
  const apiResponse = await saIndividualDetailsService.getItsaStatus({nino, taxYear, session: req.session});

  // Extract status and statusReason
	const statusDetails = apiResponse.body.itsaStatuses?.[0]?.itsaStatusDetails?.[0];
	const status = statusDetails?.status || null;

	// Set session data
	req.session.user.nino = nino;
	req.session.user.itsaStatus = status;

  return res.status(apiResponse.status).json(apiResponse.body);
});

module.exports = { 
  getItsaStatus
};