const { TwitterApi } = require('twitter-api-v2');
const twitterConfig = require('../config/twitter');
const fs = require('fs');

/**
 * Simplified Twitter Client that uses OAuth 1.0a for both v1 and v2 endpoints
 * This often works because twitter-api-v2 library handles the auth conversion
 */
class TwitterClientSimplified {
  constructor() {
    // Single client with OAuth 1.0a - works for both v1 and v2 in most cases
    this.client = new TwitterApi({
      appKey: twitterConfig.apiKey,
      appSecret: twitterConfig.apiSecret,
      accessToken: twitterConfig.accessToken,
      accessSecret: twitterConfig.accessTokenSecret,
    });

    // Keep bearer for read-only operations
    this.bearer = new TwitterApi(twitterConfig.bearerToken);
  }

  async getUserProfile(username) {
    try {
      // Remove @ if present
      const cleanUsername = username.replace('@', '');

      const user = await this.bearer.v2.userByUsername(cleanUsername, {
        'user.fields': ['profile_image_url', 'name', 'username']
      });

      return {
        id: user.data.id,
        name: user.data.name,
        username: user.data.username,
        profileImageUrl: user.data.profile_image_url?.replace('_normal', '_400x400') // Get higher resolution
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async createTweetWithMedia(text, imagePath) {
    try {
      console.log('🔄 Uploading media with OAuth 1.0a...');
      // Upload media using v1 endpoint
      const mediaId = await this.client.v1.uploadMedia(imagePath);
      console.log('✅ Media uploaded, ID:', mediaId);

      console.log('🔄 Creating tweet with v2 endpoint using same OAuth 1.0a client...');
      // Try v2 tweet creation with same client (twitter-api-v2 handles auth conversion)
      const tweet = await this.client.v2.tweet({
        text: text,
        media: {
          media_ids: [mediaId]
        }
      });

      console.log('🎉 Tweet created successfully!');
      console.log('   Tweet ID:', tweet.data.id);
      console.log('   Tweet URL: https://twitter.com/i/web/status/' + tweet.data.id);
      return tweet;
    } catch (error) {
      console.error('❌ Error creating tweet:', error);

      // Enhanced error reporting
      if (error.code === 403 || error.status === 403) {
        console.error('\n💡 403 Forbidden Error - Debugging info:');
        console.error('   Error details:', {
          code: error.code,
          status: error.status,
          message: error.message,
          data: error.data
        });

        console.error('\n🔧 Possible solutions:');
        console.error('   1. Verify Twitter app has "Read and Write" permissions');
        console.error('   2. Regenerate your Access Token and Secret in Twitter Developer Portal');
        console.error('   3. Ensure app is attached to a Project');
        console.error('   4. Check if you hit rate limits (300 tweets per 3h window)');
        console.error('   5. Avoid duplicate tweet content');
        console.error('   6. Try the OAuth 2.0 method instead');
      }

      throw error;
    }
  }

  async createTweetDraft(text, imagePath) {
    try {
      // For MVP, we'll just log the draft instead of posting
      console.log('=== TWEET DRAFT ===');
      console.log('Text:', text);
      console.log('Image:', imagePath);
      console.log('==================');

      // Verify image exists
      if (fs.existsSync(imagePath)) {
        console.log('✓ Image file exists and ready for upload');
      } else {
        console.log('✗ Image file not found');
      }

      return {
        text,
        imagePath,
        status: 'draft',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating tweet draft:', error);
      throw error;
    }
  }

  async postTweetDraft(draft) {
    try {
      return await this.createTweetWithMedia(draft.text, draft.imagePath);
    } catch (error) {
      console.error('Error posting tweet from draft:', error);
      throw error;
    }
  }
}

module.exports = TwitterClientSimplified;