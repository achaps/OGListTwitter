require('dotenv').config();
const CanvasImageProcessor = require('../lib/canvasImageProcessor');
const TwitterClientSimplified = require('../lib/twitterClientSimplified');
const path = require('path');

class OGListTwitter {
  constructor() {
    this.templatePath = process.env.TEMPLATE_IMAGE_PATH || './images/template/Laika OG List.png';
    this.outputDir = process.env.OUTPUT_DIRECTORY || './output';
    this.imageProcessor = new CanvasImageProcessor(this.templatePath);
    this.twitterClient = new TwitterClientSimplified();
  }

  async generateWelcomeImage(userData) {
    try {
      const { username, name, profileImageUrl } = userData;

      // Create output filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputPath = path.join(this.outputDir, `welcome-${username}-${timestamp}.png`);

      // Generate custom image with name, handle, and profile picture
      await this.imageProcessor.createCustomImage(
        name || username,
        username,
        profileImageUrl,
        outputPath
      );

      return outputPath;
    } catch (error) {
      console.error('Error generating welcome image:', error);
      throw error;
    }
  }

  async createWelcomeTweet(userData, tweetText) {
    try {
      // Generate custom image
      const imagePath = await this.generateWelcomeImage(userData);

      // Create tweet draft
      const draft = await this.twitterClient.createTweetDraft(tweetText, imagePath);

      console.log('Welcome tweet draft created successfully!');
      return { draft, imagePath };
    } catch (error) {
      console.error('Error creating welcome tweet:', error);
      throw error;
    }
  }

  async publishTweet(draft) {
    try {
      return await this.twitterClient.postTweetDraft(draft);
    } catch (error) {
      console.error('Error publishing tweet:', error);
      throw error;
    }
  }

  async processUserList(userList) {
    const results = [];

    for (const userData of userList) {
      try {
        console.log(`Processing user: ${userData.username || userData.name}`);

        const tweetText = `Welcome @${userData.username} to the Laika OG List! 🐕✨`;
        const result = await this.createWelcomeTweet(userData, tweetText);

        results.push({
          user: userData,
          success: true,
          ...result
        });

        console.log(`✓ Successfully processed ${userData.username || userData.name}`);
      } catch (error) {
        console.error(`✗ Failed to process ${userData.username || userData.name}:`, error.message);
        results.push({
          user: userData,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }
}

module.exports = OGListTwitter;