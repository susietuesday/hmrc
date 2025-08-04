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

module.exports = {
  setSessionUser,
  requireUser
};