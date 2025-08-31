const saIndividualDetailsRepo = require('../repositories/saIndividualDetailsRepo');

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

async function getItsaStatus({nino, taxYear, context}) {
  const response = await saIndividualDetailsRepo.fetchItsaStatus({nino, taxYear, context});

  return response;
}

async function getMtdEligible({nino, taxYear, context}) {
  const response = await getItsaStatus({nino, taxYear, context});

  // Check response status and handle known validation/error responses
  if (response.status !== 200) {
    const code = response.body.code
    // Return failure for controller
    return { success: false, code };
  }

  const statusDetails = response.body.itsaStatuses?.[0]?.itsaStatusDetails?.[0];
  const status = statusDetails?.status || null;
  const eligible = status === 'MTD Mandated' || status === 'MTD Voluntary';

  return { success: true, eligible };
};

module.exports = { getItsaStatus, getMtdEligible };