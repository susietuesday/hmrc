const asyncHandler = require('express-async-handler');
const { testServices } = require('../services/testSupportService.js');

const showDevToolsPage = asyncHandler(async(req, res) => {
  res.render('dev-tools', {
    service: `${testServices.hello.name} (v${testServices.hello.version})`,
    unRestrictedEndpoint: testServices.hello.routes.world,
    appRestrictedEndpoint: testServices.hello.routes.application,
    userRestrictedEndpoint: testServices.hello.routes.user
  });
});

module.exports = { showDevToolsPage };