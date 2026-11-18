const { escapeXml, textBlock, rect, imageBlock, statusTags, careRecordsText, watermark, svgRoot, safeDate } = require('./shared');

function renderTemplate(data) {
  const image = data.imageDataUris && data.imageDataUris[0];
  const careText = careRecordsText(data);
  return svgRoot(`
    ${rect(46, 46, 988, 1348, '#FFFDF8', 56)}
    ${rect(72, 72, 936, 1296, '#FFF7E8', 44)}
    <text x="540" y="122" font-size="64" font-weight="900" fill="#3B3028" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">今日毛孩日报</text>
    <text x="540" y="174" font-size="30" fill="#9A6A35" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">${safeDate(data)} · ${escapeXml(data.petName || '毛孩子')}</text>
    ${imageBlock(image, 110, 230, 860, 455, { radius: 44, bg: '#FFFDF8', title: '今日可爱瞬间', fit: 'meet' })}
    ${statusTags(data, 110, 735, { width: 405, gapX: 50, fill: '#FFF1D8', labelFill: '#9A6A35', valueFill: '#3B3028' })}
    ${rect(110, 1025, 860, 188, '#FFFFFF', 34)}
    <text x="146" y="1075" font-size="29" font-weight="700" fill="#9A6A35" font-family="PingFang SC, Microsoft YaHei, sans-serif">今日小记</text>
    ${textBlock(data.dailyNote || '今天也是认真陪伴毛孩子的一天。', 146, 1124, { maxChars: 24, maxLines: 3, size: 31, fill: '#3B3028', lineHeight: 42 })}
    ${careText ? `${rect(110, 1242, 860, 70, '#FFEBC9', 34)}<text x="146" y="1287" font-size="27" fill="#8C5524" font-family="PingFang SC, Microsoft YaHei, sans-serif">今日已完成：${escapeXml(careText)}</text>` : ''}
    <text x="540" y="1350" font-size="23" fill="#8B7765" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">本记录仅作日常养护观察，不替代兽医诊断。</text>
    ${watermark(data)}
  `, '#FFF7E8');
}

module.exports = renderTemplate;
