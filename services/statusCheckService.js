// services/statusCheckService.js
const { getSelfAssessmentStatus } = require('./selfAssessmentIndividualDetailsService');
const { getBusinessStatus } = require('./businessDetailsService');
const { getObligationsStatus } = require('./obligationsService');

async function runAllStatusChecks(nino) {
  const selfAssessment = await getSelfAssessmentStatus(nino);
  const business = await getBusinessStatus(nino);
  const obligations = await getObligationsStatus(nino);

  return { selfAssessment, business, obligations };
}

module.exports = { runAllStatusChecks };