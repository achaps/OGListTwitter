const { TwitterApi } = require('twitter-api-v2');
const twitterConfig = require('../config/twitter');
const fs = require('fs');

class TwitterClient {
  constructor() {
    this.client = new TwitterApi({
      appKey: twitterConfig.apiKey,
      appSecret: twitterConfig.apiSecret,
      accessToken: twitterConfig.accessToken,
      accessSecret: twitterConfig.accessTokenSecret,
    });

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
      // Upload media first
      const mediaId = await this.client.v1.uploadMedia(imagePath);

      // Create tweet with media
      const tweet = await this.client.v2.tweet({
        text: text,
        media: {
          media_ids: [mediaId]
        }
      });

      console.log('Tweet created successfully:', tweet.data.id);
      return tweet;
    } catch (error) {
      console.error('Error creating tweet:', error);
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

module.exports = TwitterClient;