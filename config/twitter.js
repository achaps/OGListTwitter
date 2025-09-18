require('dotenv').config();

const twitterConfig = {
  apiKey: process.env.TWITTER_API_KEY,
  apiSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  bearerToken: process.env.TWITTER_BEARER_TOKEN,
  // OAuth 2.0 Bearer token with user context for v2 endpoints
  oauth2UserToken: process.env.TWITTER_OAUTH2_USER_TOKEN
};

module.exports = twitterConfig;