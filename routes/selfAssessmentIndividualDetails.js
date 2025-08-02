const asyncHandler = require('express-async-handler');

const { 
  log, 
  callApi,
  getUserRestrictedToken
} = require('../utils');

const services = {
  selfAssessmentIndividualDetails: {
    name: 'individuals/person',
    version: '2.0',
    routes: {
      itsaStatus: (nino, taxYear) => `/itsa-status/${encodeURIComponent(nino)}/${encodeURIComponent(taxYear)}`
    }
  }
};

/*
Statuses
--------------
No Status
MTD Mandated
MTD Voluntary
Annual
Non Digital
Dormant
MTD Exempt

Status reasons
---------------
Sign up - return available
Sign up - no return available
ITSA final declaration
ITSA Q4 declaration
CESA SA return
Complex
Ceased income source
Reinstated income source
Rollover
Income Source Latency Changes
MTD ITSA Opt-Out
MTD ITSA Opt-In
Digitally Exempt
*/
const itsaStatusMessages = {
  "No Status": {
    "Sign up - return available": "You're not signed up for Making Tax Digital for Income Tax, but you still need to send a tax return this year.",
    "Sign up - no return available": "You're not signed up for Making Tax Digital for Income Tax and do not need to send a tax return this year.",
    "CESA SA return": "You've sent a Self Assessment tax return using the classic service.",
    "Complex": "Your tax affairs are complex and not currently included in Making Tax Digital for Income Tax.",
    "Digitally Exempt": "You're exempt from sending updates using software.",
    "default": "You're not signed up for Making Tax Digital for Income Tax. Check what you need to do with HMRC."
  },

  "MTD Mandated": {
    "MTD ITSA Opt-In": "You've signed up to use software to keep digital records and send updates to HMRC.",
    "MTD ITSA Opt-Out": "You've opted out of using software to keep digital records and send updates to HMRC. You may still need to send a tax return.",
    "Sign up - return available": "You've signed up to use software and need to send a return for this tax year.",
    "Sign up - no return available": "You've signed up to use software but don't need to send a return this year.",
    "ITSA Q4 declaration": "You've sent your fourth quarterly update. Next, you need to send an end of period statement.",
    "ITSA final declaration": "You've sent your final declaration. Your return for this tax year is complete.",
    "Ceased income source": "One of your income sources has stopped. You still need to send updates for the period it was active.",
    "Reinstated income source": "A previously stopped income source has started again. Include it in your updates.",
    "Rollover": "Your income source has carried over to the next tax year.",
    "Income Source Latency Changes": "HMRC has updated your income source details. Check what you need to do.",
    "CESA SA return": "You've sent a Self Assessment tax return using the classic service.",
    "Complex": "Your tax situation is complex. You might need extra help or may not be fully using software.",
    "Digitally Exempt": "You're exempt from sending updates using software.",
    "default": "You're using software to manage your tax. Check what updates you need to send."
  },

  "MTD Voluntary": {
    "MTD ITSA Opt-In": "You've signed up voluntarily to use software to manage your tax.",
    "Sign up - return available": "You're using software and need to send a return for this year.",
    "Sign up - no return available": "You're using software but don't need to send a return this year.",
    "ITSA Q4 declaration": "You've sent your fourth quarterly update. Next, send your end of period statement.",
    "ITSA final declaration": "You've completed your final declaration for this tax year.",
    "default": "You're using software voluntarily. Keep sending updates as needed."
  },

  "Annual": {
    "default": "You send a tax return once a year and don't need to send quarterly updates."
  },

  "Non Digital": {
    "default": "You're not required to send digital updates. Keep using the classic Self Assessment service."
  },

  "Dormant": {
    "default": "Your account is currently dormant. You don't need to take any action unless your situation changes."
  },

  "MTD Exempt": {
    "Digitally Exempt": "You've been granted an exemption from using software to manage your tax.",
    "default": "You're exempt from using software to manage your tax."
  }
};

const fetchItsaStatus = asyncHandler(async(req, res) => {
  const nino = req.query.nino;
  const taxYear = req.query.taxYear;
  const accessToken = await getUserRestrictedToken(req);
  const serviceName = services.selfAssessmentIndividualDetails.name;
  const serviceVersion = services.selfAssessmentIndividualDetails.version;
  const routePath = services.selfAssessmentIndividualDetails.routes.itsaStatus(nino, taxYear);
  
  const apiResponse = await callApi({
    method: 'GET',
    serviceName: serviceName,
    serviceVersion: serviceVersion,
    routePath: routePath,
    bearerToken: accessToken,
    extraHeaders: {'Gov-Test-Scenario': 'STATEFUL'}
  });

	// Extract status and statusReason
	const statusDetails = apiResponse.body.itsaStatuses?.[0]?.itsaStatusDetails?.[0];
	const status = statusDetails?.status || null;
	const statusReason = statusDetails?.statusReason || null;

	// Set session data
	req.session.user.nino = nino;
	req.session.user.itsaStatus = status;
	//req.session.user.itsaStatusReason = statusReason;
	
	const mtdEligible = getMtdEligible(status)
	const userMessage = getItsaUserMessage(status, statusReason);

	if (
		apiResponse.body?.itsaStatuses?.[0]?.itsaStatusDetails?.[0]
	) {
		apiResponse.body.itsaStatuses[0].itsaStatusDetails[0].mtdEligible = mtdEligible;
		apiResponse.body.itsaStatuses[0].itsaStatusDetails[0].userMessage = userMessage;
	}

  return res.status(apiResponse.status).json(apiResponse.body);
})

function getMtdEligible(itsaStatus) {
  return itsaStatus === 'MTD Mandated' || itsaStatus === 'MTD Voluntary';
}

function getItsaUserMessage(status, reason) {
  const messagesByReason = itsaStatusMessages[status];
  if (!messagesByReason) return "Status not recognised. Please contact support.";
  return messagesByReason[reason] || messagesByReason["default"] || "No message available.";
}

module.exports = { 
  fetchItsaStatus
};