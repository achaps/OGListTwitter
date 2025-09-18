const Jimp = require('jimp');
const axios = require('axios');
const path = require('path');

class ImageProcessor {
  constructor(templatePath) {
    this.templatePath = templatePath;
    this.greyCircleCenter = { x: 540, y: 455 }; // Estimated center of grey circle
    this.greyCircleRadius = 150; // Estimated radius
  }

  async createCustomImage(userName, twitterHandle, profilePictureUrl, outputPath) {
    try {
      // Load the template image
      const template = await Jimp.read(this.templatePath);

      // Download and process profile picture
      let profilePic;
      if (profilePictureUrl) {
        const response = await axios.get(profilePictureUrl, { responseType: 'arraybuffer' });
        profilePic = await Jimp.read(Buffer.from(response.data));

        // Resize profile picture to fit inside the grey circle with visible border
        // Make it slightly smaller than the circle to keep the grey border visible
        const profileSize = (this.greyCircleRadius * 2) - 20; // 20px border
        profilePic = profilePic.resize(profileSize, profileSize).circle();
      }

      // Clone template for modification
      const customImage = template.clone();

      // Position the profile picture in the center of the grey circle
      if (profilePic) {
        const profileX = this.greyCircleCenter.x - profilePic.getWidth() / 2;
        const profileY = this.greyCircleCenter.y - profilePic.getHeight() / 2;

        customImage.composite(profilePic, profileX, profileY);
      }

      // Add text next to the profile picture
      if (userName || twitterHandle) {
        // Calculate text positioning (to the right of the circle)
        const textStartX = this.greyCircleCenter.x + this.greyCircleRadius + 40; // 40px padding from circle

        // For vertical centering, we need to account for both texts
        const totalTextHeight = 20 + 30 + 16; // name font + spacing + handle font
        const textCenterY = this.greyCircleCenter.y - (totalTextHeight / 2);

        // Add name text (Satoshi regular 20px black)
        if (userName) {
          // For now using Jimp's built-in font, will need custom font later
          const nameFont = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK); // Closest to 20px
          const nameY = textCenterY;

          customImage.print(nameFont, textStartX, nameY, userName);
        }

        // Add Twitter handle (Satoshi regular 16px grey) 30px below name
        if (twitterHandle) {
          // Ensure handle starts with @
          const handle = twitterHandle.startsWith('@') ? twitterHandle : `@${twitterHandle}`;

          // For now using Jimp's built-in font, will need custom font and grey color later
          const handleFont = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK); // Will need to make this grey
          const handleY = textCenterY + 20 + 30; // name height + spacing

          customImage.print(handleFont, textStartX, handleY, handle);
        }
      }

      // Save the customized image
      await customImage.writeAsync(outputPath);

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

      const image = await Jimp.read(buffer);
      await image.writeAsync(localPath);

      return localPath;
    } catch (error) {
      console.error('Error downloading profile picture:', error);
      throw error;
    }
  }
}

module.exports = ImageProcessor;