const OGListTwitter = require('./src/index');

// Example usage
async function runExample() {
  const app = new OGListTwitter();

  // Example user data (replace with your actual data)
  const sampleUsers = [
    {
      username: 'elonmusk',
      name: 'Elon Musk',
      profileImageUrl: 'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg'
    },
    {
      username: 'DofusDofusDofus',
      name: 'Yu G 𓆏 (𝔹/acc)',
      profileImageUrl: 'https://pbs.twimg.com/profile_images/513960006404673537/Ooxx4nMA_400x400.png'
    }
  ];

  try {
    console.log('Processing user list...');
    const results = await app.processUserList(sampleUsers);

    console.log('\n=== PROCESSING COMPLETE ===');
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.user.name || result.user.username}`);
      console.log(`   Status: ${result.success ? '✓ Success' : '✗ Failed'}`);
      if (result.success) {
        console.log(`   Image: ${result.imagePath}`);
        console.log(`   Draft created: ${result.draft.timestamp}`);
      } else {
        console.log(`   Error: ${result.error}`);
      }
    });

    // Example: Publish the first successful draft
    const firstSuccess = results.find(r => r.success);
    if (firstSuccess) {
      console.log('\n=== EXAMPLE: Publishing first tweet ===');
      console.log('Uncomment the line below to actually post the tweet:');
      console.log('// await app.publishTweet(firstSuccess.draft);');
    }

  } catch (error) {
    console.error('Error running example:', error);
  }
}

// Run example if this file is executed directly
if (require.main === module) {
  runExample();
}

module.exports = { runExample };