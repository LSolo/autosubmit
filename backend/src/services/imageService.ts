import sharp from 'sharp';
import path from 'path';
import fs from 'fs-extra';

interface ResizeConfig {
  width: number;
  height: number;
  name: string;
}

const ANDROID_ICON_SIZES: ResizeConfig[] = [
  { width: 48, height: 48, name: 'mipmap-mdpi/ic_launcher.png' },
  { width: 72, height: 72, name: 'mipmap-hdpi/ic_launcher.png' },
  { width: 96, height: 96, name: 'mipmap-xhdpi/ic_launcher.png' },
  { width: 144, height: 144, name: 'mipmap-xxhdpi/ic_launcher.png' },
  { width: 192, height: 192, name: 'mipmap-xxxhdpi/ic_launcher.png' },
  { width: 512, height: 512, name: 'play_store_512.png' },
];

const IOS_ICON_SIZES: ResizeConfig[] = [
  { width: 1024, height: 1024, name: 'AppStoreIcon.png' },
  { width: 20, height: 20, name: 'Icon-App-20x20@1x.png' },
  { width: 40, height: 40, name: 'Icon-App-20x20@2x.png' },
  { width: 60, height: 60, name: 'Icon-App-20x20@3x.png' },
  { width: 29, height: 29, name: 'Icon-App-29x29@1x.png' },
  { width: 58, height: 58, name: 'Icon-App-29x29@2x.png' },
  { width: 87, height: 87, name: 'Icon-App-29x29@3x.png' },
  { width: 40, height: 40, name: 'Icon-App-40x40@1x.png' },
  { width: 80, height: 80, name: 'Icon-App-40x40@2x.png' },
  { width: 120, height: 120, name: 'Icon-App-40x40@3x.png' },
  { width: 120, height: 120, name: 'Icon-App-60x60@2x.png' },
  { width: 180, height: 180, name: 'Icon-App-60x60@3x.png' },
  { width: 76, height: 76, name: 'Icon-App-76x76@1x.png' },
  { width: 152, height: 152, name: 'Icon-App-76x76@2x.png' },
  { width: 167, height: 167, name: 'Icon-App-83.5x83.5@2x.png' },
];

export class ImageService {
  
  async processIcons(inputPath: string, outputDir: string, platform: 'android' | 'ios' | 'both'): Promise<string[]> {
    const generatedFiles: string[] = [];
    
    await fs.ensureDir(outputDir);

    if (platform === 'android' || platform === 'both') {
      const androidDir = path.join(outputDir, 'android');
      await fs.ensureDir(androidDir);
      
      for (const config of ANDROID_ICON_SIZES) {
        const filePath = path.join(androidDir, config.name);
        await fs.ensureDir(path.dirname(filePath));
        
        await sharp(inputPath)
          .resize(config.width, config.height)
          .toFile(filePath);
        
        generatedFiles.push(filePath);
      }
    }

    if (platform === 'ios' || platform === 'both') {
      const iosDir = path.join(outputDir, 'ios');
      await fs.ensureDir(iosDir);

      for (const config of IOS_ICON_SIZES) {
        const filePath = path.join(iosDir, config.name);
        
        await sharp(inputPath)
          .resize(config.width, config.height)
          // iOS icons shouldn't have transparency usually, but we'll keep input as is for now or force remove alpha if needed.
          // App Store Connect requires no transparency for the main icon.
          .flatten({ background: { r: 255, g: 255, b: 255 } }) // Ensure no transparency
          .toFile(filePath);

        generatedFiles.push(filePath);
      }
    }

    return generatedFiles;
  }

  async resizeScreenshot(inputPath: string, outputDir: string, width: number, height: number, format: 'png' | 'jpg' | 'webp' = 'jpg'): Promise<string> {
    await fs.ensureDir(outputDir);
    const fileName = `screenshot_${width}x${height}.${format}`;
    const filePath = path.join(outputDir, fileName);

    await sharp(inputPath)
      .resize(width, height, { fit: 'cover' })
      .toFormat(format)
      .toFile(filePath);

    return filePath;
  }

  async frameScreenshot(
    inputPath: string, 
    outputDir: string, 
    options: {
      platform: 'android' | 'ios';
      backgroundColor: string;
      caption: string;
      textColor: string;
    }
  ): Promise<string> {
    await fs.ensureDir(outputDir);
    const timestamp = Date.now();
    const fileName = `framed_${options.platform}_${timestamp}.png`;
    const filePath = path.join(outputDir, fileName);

    // Target dimensions (using generic high-res mobile dimensions)
    const width = options.platform === 'ios' ? 1242 : 1080;
    const height = options.platform === 'ios' ? 2688 : 1920;
    
    // Config
    const padding = Math.floor(width * 0.1); // 10% padding
    const textAreaHeight = Math.floor(height * 0.15); // Top 15% for text
    const screenshotWidth = width - (padding * 2);
    // Calculate max height for screenshot to fit in remaining space with some bottom padding
    const screenshotMaxHeight = height - textAreaHeight - padding; 

    // 1. Create Background
    const background = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: options.backgroundColor
      }
    });

    // 2. Process Screenshot (Resize to fit width, maintaining aspect ratio)
    // We resize the input image to be the calculated screenshotWidth
    const screenshotBuffer = await sharp(inputPath)
      .resize({
        width: screenshotWidth,
        height: screenshotMaxHeight,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent padding if aspect ratio differs
      })
      .toBuffer();

    // 3. Create Caption (SVG)
    // Basic word wrapping logic for SVG could be complex, for now assume short captions or single line
    // To handle wrapping properly in a real app, we'd need more complex logic.
    // Here we use a simple SVG text element.
    const fontSize = Math.floor(width * 0.05); // 5% of width
    const svgText = `
      <svg width="${width}" height="${textAreaHeight}">
        <style>
          .title { fill: ${options.textColor}; font-size: ${fontSize}px; font-family: sans-serif; font-weight: bold; }
        </style>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="title">${options.caption}</text>
      </svg>
    `;

    // 4. Composite
    await background
      .composite([
        { input: Buffer.from(svgText), top: padding / 2, left: 0 },
        { input: screenshotBuffer, top: textAreaHeight, left: padding }
      ])
      .png()
      .toFile(filePath);

    return filePath;
  }
}
