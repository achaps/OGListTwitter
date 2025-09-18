const OGListTwitter = require('./src/index');

// Test publishing functionality
async function testPublishing() {
  const app = new OGListTwitter();

  // Sample user for testing
  const testUser = {
    username: 'elonmusk',
    name: 'Elon Musk',
    profileImageUrl: 'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg'
  };

  try {
    console.log('Creating draft for test user...');
    const tweetText = `Welcome @${testUser.username} to the Laika OG List! 🐕✨`;
    const result = await app.createWelcomeTweet(testUser, tweetText);

    console.log('\n📋 Draft created successfully!');
    console.log('Draft details:', {
      text: result.draft.text,
      imagePath: result.draft.imagePath,
      status: result.draft.status,
      timestamp: result.draft.timestamp
    });

    // Ask for confirmation before publishing
    console.log('\n⚠️  PUBLISHING TO TWITTER');
    console.log('This will post the tweet to your Twitter account.');
    console.log('The tweet will be: "' + result.draft.text + '"');
    console.log('With image: ' + result.draft.imagePath);

    // Uncomment the line below to actually publish
    console.log('\n🚀 To publish this tweet, uncomment the following line in test-publish.js:');
    console.log('// const publishResult = await app.publishTweet(result.draft);');
    console.log('\nFor safety, the actual publishing is commented out.');
    console.log('Uncomment it when you\'re ready to post to Twitter.');

    const publishResult = await app.publishTweet(result.draft);
    console.log('\n🎉 Tweet published successfully!');
    console.log('Tweet ID:', publishResult.data.id);
    console.log('Tweet URL: https://twitter.com/i/web/status/' + publishResult.data.id);

  } catch (error) {
    console.error('❌ Error during publishing test:', error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testPublishing();
}

module.exports = { testPublishing };