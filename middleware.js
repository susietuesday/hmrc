function setSessionUser(req, res, next) {
  if (!req.session.user) {
    req.session.user = {};
  }
  next();
}

function requireUser(req, res, next) {

  // Check for OAuth token
  const tokenData = req.session.oauth2Token;
  if (!tokenData) {
    req.session.caller = req.originalUrl;
    return res.redirect(authorizationUri);  // Redirect to HMRC login
  }

  // Create access token
  const accessToken = client.createToken(tokenData);

  // Check for expired token
  if (accessToken.expired()) {
    req.session.oauth2Token = null;
    return res.redirect(authorizationUri);  // Redirect to HMRC login
  }

  // Set access token
  req.accessToken = accessToken.token.access_token; // Attach it to req for later use
  next();
}

function errorHandler(err, req, res, next) {
  if (!err.stack) {
    log.error(`Error: ${err.message || 'Unknown error'}`);
  } else {
    const stackLines = err.stack.split('\n');
    const messageLine = stackLines[0];
    const locationLines = stackLines.slice(1, 3).map(line => line.trim()).join(' | ');
    log.error(`${messageLine} — ${locationLines}`);
  }

  const status = err.status || err.response?.status || 500;
  res.status(status).json({ error: 'Internal Server Error' });
}

module.exports = {
  setSessionUser,
  requireUser,
  errorHandler
};