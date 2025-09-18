const { createCanvas, loadImage, registerFont } = require('canvas');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class CanvasImageProcessor {
  constructor(templatePath) {
    this.templatePath = templatePath;
    this.greyCircleCenter = { x: 715, y: 598 }; // Plus proche du centre du cercle
    this.greyCircleRadius = 150; // Estimated radius

    // Load all Satoshi font variants using the FontLoader utility
    const FontLoader = require('../utils/fontLoader');
    FontLoader.ensureSatoshiFonts();
  }

  truncateName(name, maxLength = 15) {
    if (!name) return name;
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  }

  cleanEmojiFromName(name) {
    if (!name) return name;

    // Remove all emojis using Unicode ranges for better text rendering
    // This regex removes most emoji characters including:
    // - Basic emojis (U+1F600-U+1F64F)
    // - Additional emojis (U+1F300-U+1F5FF)
    // - Transport/map symbols (U+1F680-U+1F6FF)
    // - Extended emojis (U+1F900-U+1F9FF)
    // - Symbols and pictographs (U+2600-U+26FF)
    // - Miscellaneous symbols (U+2700-U+27BF)
    const emojiRegex = /[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F1E0}-\u{1F1FF}|\u{1F900}-\u{1F9FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu;

    return name.replace(emojiRegex, '').replace(/\s+/g, ' ').trim();
  }

  async createCustomImage(userName, twitterHandle, profilePictureUrl, outputPath) {
    try {
      // Load the template image
      const template = await loadImage(this.templatePath);

      // Create canvas with template dimensions
      const canvas = createCanvas(template.width, template.height);
      const ctx = canvas.getContext('2d');

      // Draw template as background
      ctx.drawImage(template, 0, 0);

      // Download and process profile picture
      if (profilePictureUrl) {
        try {
          const response = await axios.get(profilePictureUrl, { responseType: 'arraybuffer' });
          const profileImage = await loadImage(Buffer.from(response.data));

          // Create circular profile picture that fits inside grey circle with border
          const profileSize = (this.greyCircleRadius * 2) - 20; // 20px border
          const profileX = this.greyCircleCenter.x - profileSize / 2;
          const profileY = this.greyCircleCenter.y - profileSize / 2;

          // Save current context state
          ctx.save();

          // Create circular clipping path
          ctx.beginPath();
          ctx.arc(this.greyCircleCenter.x, this.greyCircleCenter.y, profileSize / 2, 0, Math.PI * 2);
          ctx.clip();

          // Draw profile image
          ctx.drawImage(profileImage, profileX, profileY, profileSize, profileSize);

          // Restore context
          ctx.restore();
        } catch (error) {
          console.error('Error processing profile picture:', error);
        }
      }

      // Add text next to the profile picture
      if (userName || twitterHandle) {
        // Calculate text positioning (110px to the right of the profile picture)
        const textStartX = this.greyCircleCenter.x + this.greyCircleRadius + 70; // 70px from circle edge

        // Normal text sizes as requested
        const nameSize = 50; // 40px for name
        const handleSize = 40; // 30px for handle
        const spacing = 20; // Normal spacing

        const totalTextHeight = nameSize + spacing + handleSize;
        const textCenterY = this.greyCircleCenter.y - (totalTextHeight / 2);

        // Add name text (Satoshi-Bold #3A3A3A)
        if (userName) {
          // Clean emojis and truncate name if longer than 15 characters
          const cleanedName = this.cleanEmojiFromName(userName);
          const displayName = this.truncateName(cleanedName);
          // Try Satoshi-Bold font options
          const fontOptions = [
            `${nameSize}px Satoshi-Bold`,
            `normal ${nameSize}px Satoshi-Bold`,
            `${nameSize}px "Satoshi-Bold"`,
            `bold ${nameSize}px Satoshi`,
            `${nameSize}px Arial`
          ];

          let fontApplied = false;
          for (const fontString of fontOptions) {
            try {
              ctx.font = fontString;
              console.log(`Trying name font: ${fontString}`);

              // Test if font is actually applied by measuring text
              const metrics = ctx.measureText('Test');
              if (metrics.width > 0) {
                console.log(`✓ Name font applied successfully: ${fontString}`);
                fontApplied = true;
                break;
              }
            } catch (error) {
              console.log(`Name font failed: ${fontString} - ${error.message}`);
            }
          }

          ctx.fillStyle = '#3A3A3A';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';

          const nameY = textCenterY;
          console.log(`Drawing name "${displayName}" at position (${textStartX}, ${nameY}) with Satoshi-Bold ${nameSize}px`);
          ctx.fillText(displayName, textStartX, nameY);
        }

        // Add Twitter handle (Satoshi-Medium #BFBFBF) below name
        if (twitterHandle) {
          // Ensure handle starts with @
          const handle = twitterHandle.startsWith('@') ? twitterHandle : `@${twitterHandle}`;

          // Try Satoshi-Medium with bold font-weight for heavier appearance
          const handleFontOptions = [
            `bold ${handleSize}px Satoshi-Medium`,
            `700 ${handleSize}px Satoshi-Medium`,
            `600 ${handleSize}px Satoshi-Medium`,
            `${handleSize}px Satoshi-Medium`,
            `bold ${handleSize}px Satoshi`,
            `${handleSize}px Arial`
          ];

          let handleFontApplied = false;
          for (const fontString of handleFontOptions) {
            try {
              ctx.font = fontString;
              console.log(`Trying handle font: ${fontString}`);

              // Test if font is actually applied
              const metrics = ctx.measureText('Test');
              if (metrics.width > 0) {
                console.log(`✓ Handle font applied successfully: ${fontString}`);
                handleFontApplied = true;
                break;
              }
            } catch (error) {
              console.log(`Handle font failed: ${fontString} - ${error.message}`);
            }
          }

          ctx.fillStyle = '#BFBFBF';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';

          const handleY = textCenterY + nameSize + spacing;
          console.log(`Drawing handle "${handle}" at position (${textStartX}, ${handleY}) with Satoshi-Medium (bold weight) ${handleSize}px`);
          ctx.fillText(handle, textStartX, handleY);
        }
      }

      // Save the canvas as PNG
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(outputPath, buffer);

      console.log(`Custom image created: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('Error creating custom image:', error);
      throw error;
    }
  }

  async downloadProfilePicture(profileUrl, localPath) {
    try {
      const response = await axios.get(profileUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);
      fs.writeFileSync(localPath, buffer);
      return localPath;
    } catch (error) {
      console.error('Error downloading profile picture:', error);
      throw error;
    }
  }
}

module.exports = CanvasImageProcessor;