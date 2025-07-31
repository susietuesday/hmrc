const asyncHandler = require('express-async-handler');

const { 
  log, 
  callApi,
  getUserRestrictedToken
} = require('../utils');

const hmrcServices = {
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

1. No Status
Display:

⚠️ We couldn’t find your current Income Tax Self Assessment (ITSA) status.

Explanation (tooltip or small print):

This may mean you’re not yet registered for Self Assessment or HMRC hasn’t updated your status.

2. MTD Mandated
Display:

✅ You’re required to follow Making Tax Digital (MTD) rules.

Explanation:

You must use compatible software to keep digital records and submit updates to HMRC.

3. MTD Voluntary
Display:

🟢 You’re voluntarily signed up for Making Tax Digital (MTD).

Explanation:

You're using MTD even though you're not required to. You can continue submitting updates digitally.

4. Annual
Display:

📅 You’re currently submitting tax information annually (non-MTD).

Explanation:

You're not yet part of MTD and continue to file one return per year.

5. Non Digital
Display:

📄 You submit your Self Assessment in a non-digital format.

Explanation:

You may be using paper returns or another non-digital method. MTD does not apply.

6. Dormant
Display:

⏸️ Your Self Assessment record is marked as dormant.

Explanation:

You currently don’t have any active trading or income that requires reporting to HMRC.

7. MTD Exempt
Display:

🛑 You’re exempt from Making Tax Digital (MTD).

Explanation:

You’ve been granted an exemption due to qualifying circumstances such as age, disability, or location.
*/
const fetchItsaStatus = asyncHandler(async(req, res) => {
  const nino = req.query.nino;
  const taxYear = req.query.taxYear;
  const accessToken = await getUserRestrictedToken(req);
  const serviceName = hmrcServices.selfAssessmentIndividualDetails.name;
  const serviceVersion = hmrcServices.selfAssessmentIndividualDetails.version;
  const routePath = hmrcServices.selfAssessmentIndividualDetails.routes.itsaStatus(nino, taxYear);
  
  const apiResponse = await callApi({
    method: 'GET',
    serviceName: serviceName,
    serviceVersion: serviceVersion,
    routePath: routePath,
    bearerToken: accessToken
  });

  res.status(apiResponse.status).json(apiResponse.body);
})

module.exports = { 
  fetchItsaStatus
};