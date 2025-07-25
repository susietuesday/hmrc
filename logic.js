const axios = require('axios');
const asyncHandler = require('express-async-handler');
const { getApplicationRestrictedToken } = require('./auth'); 
const { log } = require('./utils');
const { apiBaseUrl } = require('./config'); 

const servicesHandler = asyncHandler(async (req, res) => {
  const accessToken = await getApplicationRestrictedToken();

  const response = await axios.get(
    `${apiBaseUrl}create-test-user/services`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.hmrc.1.0+json'
      }
    }
  );

  log.info('Available services:', response.data);
  res.json(response.data);
});

module.exports = { servicesHandler };
