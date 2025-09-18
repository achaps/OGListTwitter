const OGListTwitter = require('./src/index');
const readline = require('readline');

// Interactive publishing functionality
async function interactivePublishing() {
  const app = new OGListTwitter();

  // Sample users for testing
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

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askQuestion = (question) => {
    return new Promise((resolve) => {
      rl.question(question, resolve);
    });
  };

  try {
    console.log('🚀 OGListTwitter Interactive Publishing');
    console.log('=====================================\n');

    console.log('Processing user list and creating drafts...');
    const results = await app.processUserList(sampleUsers);

    console.log('\n📋 DRAFT SUMMARY');
    console.log('================');

    const successfulDrafts = results.filter(r => r.success);

    successfulDrafts.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.user.name || result.user.username}`);
      console.log(`   Text: "${result.draft.text}"`);
      console.log(`   Image: ${result.draft.imagePath}`);
      console.log(`   Status: ${result.draft.status}`);
    });

    if (successfulDrafts.length === 0) {
      console.log('❌ No successful drafts to publish.');
      rl.close();
      return;
    }

    // Ask which draft to publish
    const draftChoice = await askQuestion(`\n🎯 Which draft would you like to publish? (1-${successfulDrafts.length}, or 'n' to cancel): `);

    if (draftChoice.toLowerCase() === 'n') {
      console.log('✋ Publishing cancelled.');
      rl.close();
      return;
    }

    const draftIndex = parseInt(draftChoice) - 1;

    if (draftIndex < 0 || draftIndex >= successfulDrafts.length) {
      console.log('❌ Invalid choice.');
      rl.close();
      return;
    }

    const selectedDraft = successfulDrafts[draftIndex];

    console.log(`\n📤 Selected draft for ${selectedDraft.user.name || selectedDraft.user.username}`);
    console.log(`   Text: "${selectedDraft.draft.text}"`);
    console.log(`   Image: ${selectedDraft.draft.imagePath}`);

    const confirm = await askQuestion('\n⚠️  Are you sure you want to publish this tweet to Twitter? (y/n): ');

    if (confirm.toLowerCase() !== 'y') {
      console.log('✋ Publishing cancelled.');
      rl.close();
      return;
    }

    console.log('\n🚀 Publishing tweet...');

    try {
      const publishResult = await app.publishTweet(selectedDraft.draft);
      console.log('\n🎉 TWEET PUBLISHED SUCCESSFULLY!');
      console.log(`   Tweet ID: ${publishResult.data.id}`);
      console.log(`   Tweet URL: https://twitter.com/i/web/status/${publishResult.data.id}`);
      console.log(`   Published at: ${new Date().toISOString()}`);
    } catch (error) {
      console.error('\n❌ PUBLISHING FAILED');
      console.error('   Error:', error.message);

      // Provide helpful error messages
      if (error.message.includes('401')) {
        console.error('\n💡 Possible issues:');
        console.error('   - Check your Twitter API credentials in .env');
        console.error('   - Ensure your Twitter app has write permissions');
        console.error('   - Verify access tokens are not expired');
      } else if (error.message.includes('403')) {
        console.error('\n💡 Possible issues:');
        console.error('   - Your Twitter app may not have tweet posting permissions');
        console.error('   - Rate limit exceeded');
        console.error('   - Duplicate tweet detection');
      } else if (error.message.includes('media')) {
        console.error('\n💡 Possible issues:');
        console.error('   - Image file may be corrupted');
        console.error('   - Image file too large');
        console.error('   - Unsupported image format');
      }
    }

  } catch (error) {
    console.error('❌ Error during interactive publishing:', error);
  } finally {
    rl.close();
  }
}

// Run interactive publishing if this file is executed directly
if (require.main === module) {
  interactivePublishing();
}

module.exports = { interactivePublishing };