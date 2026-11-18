const { escapeXml, textBlock, rect, imageBlock, statusTags, careRecordsText, watermark, svgRoot, safeDate } = require('./shared');

function renderTemplate(data) {
  const image = data.imageDataUris && data.imageDataUris[0];
  const careText = careRecordsText(data);
  return svgRoot(`
    ${rect(54, 54, 972, 1332, '#FFF7F9', 52)}
    <text x="118" y="145" font-size="38" fill="#FF6F91" font-family="PingFang SC, Microsoft YaHei, sans-serif">心</text>
    <text x="920" y="130" font-size="34" fill="#FF9BB3" font-family="PingFang SC, Microsoft YaHei, sans-serif">星</text>
    <circle cx="165" cy="235" r="12" fill="#FF8FAB"/>
    <circle cx="910" cy="230" r="9" fill="#FFD6E2"/>
    <text x="540" y="145" font-size="76" font-weight="900" fill="#E84D73" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">今日晒宠小记</text>
    <text x="540" y="196" font-size="30" fill="#7A3F4E" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(data.petName || '毛孩子')} · ${safeDate(data)}</text>
    ${rect(84, 242, 912, 570, '#FFFFFF', 48)}
    ${rect(132, 224, 215, 52, '#FFD1DD', 10)}
    ${rect(735, 778, 185, 42, '#FFD1DD', 10)}
    ${imageBlock(image, 116, 276, 848, 505, { radius: 34, bg: '#FFE5EB', title: '晒宠高光照', fit: 'meet' })}
    ${statusTags(data, 96, 858, { cols: 3, width: 270, height: 72, gapX: 35, gapY: 26, fill: '#FFE1EA', labelFill: '#E84D73', valueFill: '#422B31', radius: 24 })}
    ${rect(96, 1062, 888, 172, '#FFF0B8', 36)}
    <text x="132" y="1112" font-size="32" font-weight="800" fill="#E84D73" font-family="PingFang SC, Microsoft YaHei, sans-serif">今日小红心便签</text>
    ${textBlock(data.dailyNote || '今天也太适合晒出来了。', 132, 1158, { maxChars: 25, maxLines: 3, size: 30, fill: '#442F35', lineHeight: 40 })}
    ${careText ? `${rect(96, 1255, 888, 66, '#FFE1EA', 32)}<text x="132" y="1297" font-size="26" fill="#A03C57" font-family="PingFang SC, Microsoft YaHei, sans-serif">今日打卡：${escapeXml(careText)}</text>` : ''}
    <text x="540" y="1352" font-size="23" fill="#A46A78" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">适合保存、朋友圈和小红书分享。</text>
    ${watermark(data)}
  `, '#FFF1F4');
}

module.exports = renderTemplate;
