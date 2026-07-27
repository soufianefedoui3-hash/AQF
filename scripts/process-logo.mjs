import sharp from "sharp";
import { copyFileSync, existsSync } from "fs";
import { join } from "path";

const brandDir = join(process.cwd(), "public", "brand");
const sourcePath = join(brandDir, "aqf-logo-source.png");
const outputPath = join(brandDir, "aqf-logo.png");
const lightOutputPath = join(brandDir, "aqf-logo-light.png");

if (!existsSync(sourcePath)) {
  copyFileSync(outputPath, sourcePath);
}

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function saturation(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function backgroundAlpha(r, g, b) {
  const lum = luminance(r, g, b);
  const sat = saturation(r, g, b);

  if (lum > 248 && sat < 0.08) return 0;
  if (lum > 220 && sat < 0.12) return 0;
  if (lum > 190 && sat < 0.08) return Math.round(((lum - 190) / 30) * 255);
  if (lum > 175 && sat < 0.05) return Math.round(((lum - 175) / 20) * 255);

  return 255;
}

function isDarkBrand(r, g, b, a) {
  if (a < 20) return false;
  return luminance(r, g, b) < 95 && saturation(r, g, b) > 0.08;
}

async function processLogo() {
  const { data, info } = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const transparent = Buffer.from(data);
  const light = Buffer.from(data);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const alpha = backgroundAlpha(r, g, b);

    transparent[i + 3] = Math.min(data[i + 3], alpha);
    light[i + 3] = transparent[i + 3];

    if (transparent[i + 3] === 0) continue;

    if (isDarkBrand(r, g, b, transparent[i + 3])) {
      light[i] = 255;
      light[i + 1] = 255;
      light[i + 2] = 255;
    } else {
      light[i] = r;
      light[i + 1] = g;
      light[i + 2] = b;
    }
  }

  const meta = { width: info.width, height: info.height, channels: 4 };

  await sharp(transparent, { raw: meta }).png({ compressionLevel: 9 }).toFile(outputPath);
  await sharp(light, { raw: meta }).png({ compressionLevel: 9 }).toFile(lightOutputPath);

  console.log("Processed logos from source:", sourcePath);
}

processLogo().catch((error) => {
  console.error(error);
  process.exit(1);
});
