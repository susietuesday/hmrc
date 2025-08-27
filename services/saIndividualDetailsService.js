const saIndividualDetailsRepo = require('../repositories/saIndividualDetailsRepo');

const MESSAGES = {
  // Home
  FORMAT_NINO: `Invalid National Insurance number format. Please check and try again.`,
  CLIENT_OR_AGENT_NOT_AUTHORISED: `The National Insurance number you entered does not match your HMRC account. Please try again.`,
  ITSA_NOT_FOUND: `We couldn't find a Self Assessment record for your National Insurance number.\n\nThis usually means you're not registered for Self Assessment.\nIf you think this is wrong, please check your details or contact HMRC.`
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

async function getItsaStatus({nino, taxYear, context}) {
  const response = await saIndividualDetailsRepo.fetchItsaStatus({nino, taxYear, context});

  return response;
}

async function getMtdEligible({nino, taxYear, context}) {
  const response = await getItsaStatus({nino, taxYear, context});

  // Check response status and handle known validation/error responses
  if (response.status !== 200) {
    let message;
    switch (response.body.code) {
      case 'FORMAT_NINO':
        message = MESSAGES.FORMAT_NINO;
        break;
      case 'CLIENT_OR_AGENT_NOT_AUTHORISED':
        message = MESSAGES.CLIENT_OR_AGENT_NOT_AUTHORISED;
        break;
      case 'MATCHING_RESOURCE_NOT_FOUND':
        message = MESSAGES.MATCHING_RESOURCE_NOT_FOUND;
        break;
      default:
        message = `Failed to fetch ITSA status: ${response.status}`;
    }
    // Return structured failure for controller
    return { success: false, message };
  }

  const statusDetails = response.body.itsaStatuses?.[0]?.itsaStatusDetails?.[0];
  const status = statusDetails?.status || null;
  const eligible = status === 'MTD Mandated' || status === 'MTD Voluntary';

  return { success: true, eligible };
};

module.exports = { getItsaStatus, getMtdEligible };