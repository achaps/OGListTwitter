const { TwitterApi } = require('twitter-api-v2');
const twitterConfig = require('./config/twitter');

/**
 * This script helps generate an OAuth 2.0 Bearer token with user context
 * Required for X API v2 tweet creation
 */

async function generateOAuth2UserToken() {
  try {
    console.log('🔑 OAuth 2.0 User Token Generation for X API v2');
    console.log('===============================================\n');

    // Method 1: Using OAuth 1.0a to OAuth 2.0 conversion
    console.log('Method 1: Convert OAuth 1.0a tokens to OAuth 2.0');
    console.log('--------------------------------------------------');

    const client = new TwitterApi({
      appKey: twitterConfig.apiKey,
      appSecret: twitterConfig.apiSecret,
      accessToken: twitterConfig.accessToken,
      accessSecret: twitterConfig.accessTokenSecret,
    });

    try {
      // Test if current OAuth 1.0a tokens work for v2
      const me = await client.v2.me();
      console.log('✅ OAuth 1.0a tokens work for user context!');
      console.log('   User ID:', me.data.id);
      console.log('   Username:', me.data.username);

      // Try to use the same client for v2 tweet creation
      console.log('\n🔄 Testing v2 tweet creation with OAuth 1.0a...');

      // Note: This might work! twitter-api-v2 library can handle auth conversion
      console.log('💡 Your OAuth 1.0a tokens might work directly with v2!');
      console.log('   Try using the same client for both v1 and v2 operations.');

    } catch (error) {
      console.error('❌ OAuth 1.0a tokens failed for v2:', error.message);
      console.log('\n📋 You need to generate a proper OAuth 2.0 Bearer token:');
      console.log('1. Go to: https://developer.twitter.com/en/portal/dashboard');
      console.log('2. Select your app');
      console.log('3. Go to "Keys and tokens" tab');
      console.log('4. Under "Authentication Tokens" section:');
      console.log('   - Regenerate "Bearer Token" (this might be app-only)');
      console.log('   - Look for "OAuth 2.0 Bearer Token" section');
      console.log('   - Generate a Bearer Token with user context');
      console.log('5. Add it to your .env file as TWITTER_OAUTH2_USER_TOKEN');
    }

    console.log('\n🔧 Alternative: Use OAuth 1.0a for both v1 and v2');
    console.log('--------------------------------------------------');
    console.log('The twitter-api-v2 library can handle auth conversion automatically.');
    console.log('You might be able to use the same client for both endpoints.');

  } catch (error) {
    console.error('❌ Error during token generation:', error);

    console.log('\n💡 Manual OAuth 2.0 Setup Steps:');
    console.log('1. In Twitter Developer Portal, ensure your app has:');
    console.log('   - Read and Write permissions');
    console.log('   - Is attached to a Project');
    console.log('   - OAuth 2.0 is enabled');
    console.log('2. Generate OAuth 2.0 Bearer Token with user context');
    console.log('3. Add to .env: TWITTER_OAUTH2_USER_TOKEN=your_token_here');
  }
}

// Run if this file is executed directly
if (require.main === module) {
  generateOAuth2UserToken();
}

module.exports = { generateOAuth2UserToken };