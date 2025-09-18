const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { registerFont } = require('canvas');

class FontLoader {
  static async ensureSatoshiFonts() {
    const fonts = [
      { path: 'Satoshi-Regular.ttf', family: 'Satoshi' },
      { path: 'Satoshi-Bold.ttf', family: 'Satoshi-Bold' },
      { path: 'Satoshi-Medium.ttf', family: 'Satoshi-Medium' }
    ];

    let loadedFonts = 0;

    for (const font of fonts) {
      const fontPath = path.join(__dirname, '../fonts/', font.path);

      if (fs.existsSync(fontPath)) {
        try {
          registerFont(fontPath, { family: font.family });
          console.log(`✓ ${font.family} font loaded from local file`);
          loadedFonts++;
        } catch (error) {
          console.error(`Error registering ${font.family} font:`, error.message);
        }
      } else {
        console.log(`${font.family} font not found at: ${fontPath}`);
      }
    }

    if (loadedFonts === 0) {
      console.log('To use Satoshi fonts:');
      console.log('1. Download Satoshi-Regular.ttf, Satoshi-Bold.ttf, Satoshi-Medium.ttf');
      console.log('2. Place them in the /fonts/ directory');
      console.log('3. The application will use system fallback fonts in the meantime');
    }

    return loadedFonts > 0;
  }

  // Keep the old method for backwards compatibility
  static async ensureSatoshiFont() {
    return this.ensureSatoshiFonts();
  }

  static async downloadSatoshiFont(url) {
    if (!url) {
      console.log('No font URL provided');
      return false;
    }

    try {
      const fontPath = path.join(__dirname, '../fonts/Satoshi-Regular.ttf');

      // Create fonts directory if it doesn't exist
      const fontsDir = path.dirname(fontPath);
      if (!fs.existsSync(fontsDir)) {
        fs.mkdirSync(fontsDir, { recursive: true });
      }

      console.log('Downloading Satoshi font...');
      const response = await axios.get(url, { responseType: 'arraybuffer' });

      fs.writeFileSync(fontPath, Buffer.from(response.data));
      console.log('✓ Satoshi font downloaded successfully');

      // Register the downloaded font
      registerFont(fontPath, { family: 'Satoshi' });
      console.log('✓ Satoshi font registered');

      return true;
    } catch (error) {
      console.error('Error downloading Satoshi font:', error.message);
      return false;
    }
  }
}

module.exports = FontLoader;