const { prisma } = require('../lib/prismaClient');

async function createPropertySubmission(nino, businessId, taxYear, body, response) {
  const submission = await prisma.propertySubmission.create({
    data: {
      request_body: body,                // store body JSON directly
      response_code: response?.status,   // or 200 if you want fixed
      response_body: response?.data,     // store API response JSON directly
      nino,                              // must match length 9
      business_id: businessId,           // max length 20
      tax_year: taxYear,                 // length 7
    },
  });

  console.log("New submission created:", submission);
};

module.exports = {
  createPropertySubmission
};