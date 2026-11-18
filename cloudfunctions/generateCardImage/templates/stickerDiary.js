const { escapeXml, textBlock, rect, line, imageBlock, statusTags, careRecordsText, watermark, svgRoot, safeDate } = require('./shared');

function polaroid(image, x, y, rotate, caption) {
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate})">
      ${rect(0, 0, 420, 405, '#FFFFFF', 18)}
      ${imageBlock(image, 22, 22, 376, 300, { radius: 12, bg: '#F7F1E4', title: '拍立得照片', fit: 'meet' })}
      <text x="210" y="365" font-size="24" fill="#7A5A35" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(caption)}</text>
    </g>
  `;
}

function renderTemplate(data) {
  const images = data.imageDataUris || [];
  const careText = careRecordsText(data);
  return svgRoot(`
    ${Array.from({ length: 22 }).map((_, index) => line(76, 140 + index * 52, 1004, 140 + index * 52, 'rgba(194,159,89,0.22)', 2)).join('')}
    <text x="540" y="112" font-size="64" font-weight="900" fill="#8C5524" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">毛孩手账日记</text>
    <text x="540" y="160" font-size="28" fill="#9A6A35" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">${safeDate(data)} · 胶带、贴纸和便签</text>
    ${rect(125, 218, 250, 58, '#FFB3A7', 12)}
    ${rect(700, 225, 240, 52, '#77BFA3', 12)}
    <text x="870" y="230" font-size="28" fill="#77BFA3" font-family="PingFang SC, Microsoft YaHei, sans-serif">爪印</text>
    ${polaroid(images[0], 86, 255, -5, '今日留影 A')}
    ${polaroid(images[1] || images[0], 565, 255, 5, '今日留影 B')}
    ${statusTags(data, 96, 730, { cols: 3, width: 270, height: 62, gapX: 36, gapY: 28, fill: '#FFD6E2', labelFill: '#8C5524', valueFill: '#5E4635', radius: 20 })}
    ${rect(110, 950, 860, 248, '#FFF9C8', 28)}
    <text x="150" y="1005" font-size="34" font-weight="900" fill="#8C5524" font-family="PingFang SC, Microsoft YaHei, sans-serif">便签小记</text>
    ${textBlock(data.dailyNote || '今天也被可爱击中了。', 150, 1052, { maxChars: 24, maxLines: 4, size: 30, fill: '#5E4635', lineHeight: 42 })}
    ${careText ? `${rect(110, 1228, 860, 66, '#FFE1B5', 30)}<text x="150" y="1270" font-size="26" fill="#8C5524" font-family="PingFang SC, Microsoft YaHei, sans-serif">今日贴纸：${escapeXml(careText)}</text>` : ''}
    <text x="540" y="1350" font-size="23" fill="#9A6A35" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">像一本可爱的宠物手账。</text>
    ${watermark(data)}
  `, '#FFF4D6');
}

module.exports = renderTemplate;
