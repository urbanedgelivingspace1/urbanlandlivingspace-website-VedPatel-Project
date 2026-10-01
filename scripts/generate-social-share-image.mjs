import { join } from "node:path";

import sharp from "sharp";

const projectRoot = process.cwd();
const logoPath = join(projectRoot, "public/brand/urbanedge-land-space-logo.png");
const outputPath = join(projectRoot, "public/brand/urbanedge-social-share.png");

const width = 1200;
const height = 630;

const logo = await sharp(logoPath)
  .resize(408, 408, { fit: "cover" })
  .png({ compressionLevel: 9 })
  .toBuffer();

const artwork = Buffer.from(`
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
        <stop stop-color="#001F3F"/>
        <stop offset="0.58" stop-color="#01043D"/>
        <stop offset="1" stop-color="#061940"/>
      </linearGradient>
      <linearGradient id="gold" x1="70" y1="0" x2="650" y2="0" gradientUnits="userSpaceOnUse">
        <stop stop-color="#F3E7BA"/>
        <stop offset="0.48" stop-color="#DABA52"/>
        <stop offset="1" stop-color="#B8891F"/>
      </linearGradient>
      <pattern id="survey" width="58" height="58" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
        <path d="M 58 0 L 0 0 0 58" fill="none" stroke="#FFFFFF" stroke-opacity="0.035" stroke-width="1"/>
      </pattern>
      <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#000000" flood-opacity="0.34"/>
      </filter>
      <clipPath id="logoClip">
        <rect x="744" y="92" width="408" height="408" rx="30"/>
      </clipPath>
    </defs>

    <rect width="1200" height="630" fill="url(#background)"/>
    <rect width="1200" height="630" fill="url(#survey)"/>
    <circle cx="1100" cy="-30" r="270" fill="#DABA52" fill-opacity="0.06"/>
    <circle cx="1100" cy="-30" r="184" fill="none" stroke="#DABA52" stroke-opacity="0.18" stroke-width="2"/>
    <path d="M 0 570 C 240 505, 480 660, 765 555 S 1100 500, 1240 560" fill="none" stroke="#DABA52" stroke-opacity="0.16" stroke-width="2"/>

    <rect x="68" y="65" width="78" height="4" rx="2" fill="url(#gold)"/>
    <text x="68" y="111" fill="#DABA52" font-family="Arial, Helvetica, sans-serif" font-size="21" font-weight="700" letter-spacing="4">URBANEDGE LAND SPACE</text>

    <text x="68" y="190" fill="#FFFFFF" font-family="Georgia, 'Times New Roman', serif" font-size="54" font-weight="700">
      <tspan x="68" dy="0">Specialist land guidance</tspan>
      <tspan x="68" dy="64">across Ahmedabad &amp;</tspan>
      <tspan x="68" dy="64">Gandhinagar.</tspan>
    </text>

    <text x="68" y="418" fill="#D7DEE9" font-family="Arial, Helvetica, sans-serif" font-size="24">
      <tspan x="68" dy="0">Agricultural, NA and Industrial land</tspan>
      <tspan x="68" dy="36">for buy, rent and lease.</tspan>
    </text>

    <g transform="translate(68 511)">
      <rect width="126" height="44" rx="22" fill="#FFFFFF" fill-opacity="0.09" stroke="#FFFFFF" stroke-opacity="0.18"/>
      <text x="63" y="29" text-anchor="middle" fill="#F3E7BA" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" letter-spacing="1">DISCOVER</text>
    </g>
    <g transform="translate(207 511)">
      <rect width="118" height="44" rx="22" fill="#FFFFFF" fill-opacity="0.09" stroke="#FFFFFF" stroke-opacity="0.18"/>
      <text x="59" y="29" text-anchor="middle" fill="#F3E7BA" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" letter-spacing="1">ADVISE</text>
    </g>
    <g transform="translate(338 511)">
      <rect width="124" height="44" rx="22" fill="#FFFFFF" fill-opacity="0.09" stroke="#FFFFFF" stroke-opacity="0.18"/>
      <text x="62" y="29" text-anchor="middle" fill="#F3E7BA" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" letter-spacing="1">CONNECT</text>
    </g>

    <rect x="732" y="80" width="432" height="432" rx="38" fill="#06173C" stroke="#DABA52" stroke-opacity="0.58" stroke-width="2" filter="url(#shadow)"/>
    <rect x="744" y="92" width="408" height="408" rx="30" fill="#06173C"/>
    <text x="948" y="558" text-anchor="middle" fill="#F3E7BA" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700" letter-spacing="1.2">THEURBANEDGELANDSPACE.COM</text>
    <rect y="618" width="1200" height="12" fill="url(#gold)"/>
  </svg>
`);

await sharp(artwork)
  .composite([
    {
      input: logo,
      left: 744,
      top: 92,
    },
  ])
  .png({ compressionLevel: 9, quality: 100 })
  .toFile(outputPath);

console.log(`Generated ${outputPath}`);
