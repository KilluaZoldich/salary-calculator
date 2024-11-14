const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#020817');
  gradient.addColorStop(1, '#1e293b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Euro symbol
  ctx.font = `bold ${size * 0.5}px -apple-system`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#60a5fa';
  ctx.fillText('€', size/2, size/2);

  // Save the icon
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(
    path.join(__dirname, '..', 'public', `icon-${size}.png`),
    buffer
  );
}

// Generate icons
generateIcon(192);
generateIcon(512);
