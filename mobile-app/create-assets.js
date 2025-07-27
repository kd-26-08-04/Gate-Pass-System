const fs = require('fs');
const path = require('path');

// Create a simple SVG icon and convert it to PNG placeholder
const createPlaceholderAsset = (filename, width, height, text) => {
  const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#4CAF50"/>
  <text x="50%" y="50%" text-anchor="middle" dy="0.35em" font-family="Arial, sans-serif" font-size="24" fill="white">${text}</text>
</svg>`;
  
  const svgPath = path.join(__dirname, 'assets', filename.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svg);
  console.log(`Created placeholder: ${filename} (as SVG)`);
  
  return svgPath;
};

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create placeholder assets
createPlaceholderAsset('icon.png', 1024, 1024, 'GP');
createPlaceholderAsset('splash.png', 1242, 2208, 'Gate Pass\nSystem');
createPlaceholderAsset('adaptive-icon.png', 1024, 1024, 'GP');
createPlaceholderAsset('favicon.png', 48, 48, 'GP');

console.log('Placeholder assets created successfully!');
console.log('Note: These are SVG placeholders. For production, replace with actual PNG images.');