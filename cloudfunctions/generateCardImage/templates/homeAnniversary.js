const { escapeXml, textBlock, rect, imageBlock, watermark, svgRoot, safeDate } = require('./shared');

function daysBetween(dateText, fallback = 520) {
  if (!dateText) return fallback;
  const start = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(start.getTime())) return fallback;
  return Math.max(1, Math.floor((Date.now() - start.getTime()) / 86400000) + 1);
}

function renderTemplate(data) {
  const image = data.imageDataUris && data.imageDataUris[0];
  const homeDays = daysBetween(data.homeDate);
  return svgRoot(`
    ${rect(68, 68, 944, 1304, '#FFFDF8', 44)}
    <text x="540" y="140" font-size="72" font-weight="900" fill="#B66F48" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">到家的第 ${homeDays} 天</text>
    <text x="540" y="190" font-size="30" fill="#8C5B3A" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">谢谢你来到这个家 · ${safeDate(data)}</text>
    <text x="140" y="235" font-size="28" fill="#C9825B" font-family="PingFang SC, Microsoft YaHei, sans-serif">小房子</text>
    <text x="850" y="235" font-size="28" fill="#C9825B" font-family="PingFang SC, Microsoft YaHei, sans-serif">脚印</text>
    ${rect(120, 245, 840, 550, '#F1D3BD', 34)}
    ${rect(155, 280, 770, 480, '#FFFFFF', 24)}
    ${imageBlock(image, 175, 300, 730, 440, { radius: 18, bg: '#FFF6EC', title: '家的相框', fit: 'meet' })}
    ${[
      ['到家纪念日', data.homeDate || data.recordDate || '未记录'],
      ['陪伴天数', `${homeDays} 天`],
      ['今日心情', data.emotionStatus || '未记录']
    ].map((item, index) => {
      const x = 110 + index * 300;
      return `
        ${rect(x, 855, 260, 120, '#FFE4D0', 28)}
        <text x="${x + 130}" y="900" font-size="24" fill="#B66F48" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(item[0])}</text>
        <text x="${x + 130}" y="945" font-size="30" fill="#4E3514" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(item[1])}</text>
      `;
    }).join('')}
    ${rect(110, 1040, 860, 190, '#FFF6EC', 34)}
    <text x="150" y="1096" font-size="34" font-weight="900" fill="#B66F48" font-family="PingFang SC, Microsoft YaHei, sans-serif">家的记忆</text>
    ${textBlock(data.dailyNote || '你来到家里的那一天，一切都变得更温暖。', 150, 1142, { maxChars: 24, maxLines: 3, size: 30, fill: '#5E4635', lineHeight: 42 })}
    ${rect(110, 1262, 860, 64, '#FFE4D0', 30)}
    <text x="540" y="1303" font-size="26" fill="#B66F48" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">适合领养纪念、到家周年和长期收藏</text>
    ${watermark(data)}
  `, '#FFF6EC');
}

module.exports = renderTemplate;
