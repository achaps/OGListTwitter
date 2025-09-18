# OGListTwitter

A JavaScript project that generates and publishes personalized welcome tweets with custom images. The system processes Twitter user data and creates customized PNG images from a base template, incorporating user profile pictures and names, then publishes tweets with both personalized text and generated images.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Twitter API credentials:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Twitter API credentials.

3. **Ensure template image exists:**
   Make sure your template image is at `./images/template/Laika OG List.png`

## Usage

### Quick Start

Run the example with sample data:
```bash
npm start
```

### Custom Usage

```javascript
const OGListTwitter = require('./src/index');

const app = new OGListTwitter();

// Process users and create drafts
const users = [
  {
    username: 'username',
    name: 'Display Name',
    profileImageUrl: 'https://example.com/profile.jpg'
  }
];

const results = await app.processUserList(users);

// Publish a specific draft
await app.publishTweet(results[0].draft);
```

## How It Works

1. **User Data Processing**: Takes a list of Twitter users with their usernames, display names, and profile image URLs
2. **Image Generation**:
   - Loads the base template image (`Laika OG List.png`)
   - Downloads and processes user profile pictures into circular format
   - Overlays the profile picture onto the template at precise coordinates
   - Renders the user's display name and Twitter handle with custom fonts (Satoshi)
   - Applies smart text processing (emoji removal, length truncation)
3. **Tweet Creation**: Generates personalized welcome messages and creates tweet drafts
4. **Publishing**: Provides options to review drafts before posting to Twitter

## Project Structure

- `src/index.js` - Main application logic and user processing
- `lib/canvasImageProcessor.js` - Advanced image generation with Canvas API
- `lib/imageProcessor.js` - Alternative image processing utilities
- `lib/twitterClient.js` - Twitter API v2 integration
- `utils/fontLoader.js` - Custom font loading for Satoshi fonts
- `fonts/` - Satoshi font files (Bold, Medium variants)
- `images/template/` - Base template images
- `output/` - Generated personalized images
- `example.js` - Example usage with sample data

## Features

### Core Functionality
- **Custom Image Generation**: Creates personalized PNG images from base templates
- **Profile Picture Integration**: Downloads and embeds Twitter profile pictures in circular format
- **Tweet Drafting**: Creates tweet drafts for review before publishing
- **Batch Processing**: Handles multiple users efficiently in sequence
- **Error Handling**: Graceful error handling with detailed logging

### Advanced Text Processing
- **Emoji Handling**: Automatically removes emojis from display names to prevent pixelated rendering
- **Name Truncation**: Intelligently truncates names longer than 15 characters with "..." suffix
- **Custom Typography**: Uses Satoshi fonts (Bold for names, Medium for handles) with fallback support
- **Smart Positioning**: Precise text and image positioning based on template coordinates

### Image Processing
- **Canvas-based Rendering**: High-quality image generation using Node.js Canvas API
- **Circular Profile Pictures**: Automatically crops and positions profile images within circular bounds
- **Template Overlay**: Seamlessly integrates user data into predefined template layouts
- **PNG Output**: Generates optimized PNG images ready for social media

## Smart Text Processing Examples

The system handles various edge cases in user names:

| Original Name | Processed Name | Reason |
|---------------|----------------|--------|
| `WIZZ🥷 ( beware scammers )` | `WIZZ ( beware s...` | Emoji removed + truncated to 15 chars |
| `Yu G 𓆏 (𝔹/acc)` | `Yu G (/acc)` | Unicode symbols removed |
| `verylongusernamehere` | `verylongusername...` | Truncated to 15 characters |
| `John Doe` | `John Doe` | No changes needed |

## Technical Requirements

- Node.js 14+ (for Canvas API support)
- Canvas dependencies (automatically installed with `node-canvas`)
- Twitter API v2 credentials with tweet posting permissions
- Template image in PNG format (1200x628px recommended)
- Satoshi font files (included in project)

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Twitter API Credentials (required)
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here
TWITTER_BEARER_TOKEN=your_bearer_token_here

# Image Configuration (optional)
TEMPLATE_IMAGE_PATH=./images/template/Laika OG List.png
OUTPUT_DIRECTORY=./output
```

## Troubleshooting

### Common Issues

**Font Loading Issues**
```bash
# Error: Satoshi font not found
# Solution: Ensure font files are in the /fonts directory
ls fonts/Satoshi-*.ttf
```

**Canvas Installation Problems**
```bash
# On macOS, install Canvas dependencies:
brew install pkg-config cairo pango libpng jpeg giflib librsvg

# On Ubuntu/Debian:
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

**Profile Image Download Failures**
- Check internet connectivity
- Verify profile image URLs are accessible
- Some profile images may be private or deleted

**Twitter API Errors**
- Verify all credentials are correct in `.env`
- Ensure your Twitter app has tweet posting permissions
- Check Twitter API rate limits