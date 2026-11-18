const { escapeXml, textBlock, rect, imageBlock, careRecordsText, watermark, svgRoot, safeDate } = require('./shared');

function daysBetween(dateText, fallback = 365) {
  if (!dateText) return fallback;
  const start = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(start.getTime())) return fallback;
  return Math.max(1, Math.floor((Date.now() - start.getTime()) / 86400000) + 1);
}

function renderTemplate(data) {
  const image = data.imageDataUris && data.imageDataUris[0];
  const careText = careRecordsText(data);
  const ageText = data.birthday ? `${Math.max(1, Math.floor(daysBetween(data.birthday) / 365))} 岁啦` : '今天值得庆祝';

  return svgRoot(`
    ${rect(54, 54, 972, 1332, '#FFFDF8', 54)}
    <text x="110" y="150" font-size="30" fill="#FF8FA3" font-family="PingFang SC, Microsoft YaHei, sans-serif">气球</text>
    <text x="875" y="145" font-size="30" fill="#D7A84D" font-family="PingFang SC, Microsoft YaHei, sans-serif">礼物</text>
    <text x="150" y="1035" font-size="28" fill="#FFB347" font-family="PingFang SC, Microsoft YaHei, sans-serif">彩带</text>
    <text x="820" y="1110" font-size="28" fill="#FF8FA3" font-family="PingFang SC, Microsoft YaHei, sans-serif">蛋糕</text>
    <text x="540" y="138" font-size="70" font-weight="900" fill="#C27A2C" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">生日快乐，我的毛孩子</text>
    <text x="540" y="188" font-size="30" fill="#8C5524" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(data.petName || '毛孩子')} · ${escapeXml(ageText)}</text>
    ${imageBlock(image, 150, 250, 780, 500, { radius: 42, bg: '#FFE8BE', title: '生日主角', fit: 'meet', stroke: '#F9D66B', strokeWidth: 8 })}
    ${rect(235, 785, 610, 100, '#F9D66B', 50)}
    <text x="540" y="848" font-size="34" font-weight="900" fill="#7A4F12" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">生日 ${escapeXml(data.birthday || data.recordDate || '')} · 陪伴 ${daysBetween(data.homeDate, 100)} 天</text>
    ${rect(110, 940, 860, 230, '#FFF4D6', 34)}
    <text x="150" y="1000" font-size="36" font-weight="900" fill="#C27A2C" font-family="PingFang SC, Microsoft YaHei, sans-serif">生日祝福</text>
    ${textBlock(data.dailyNote || '愿你一直健康快乐，被爱包围。', 150, 1052, { maxChars: 23, maxLines: 4, size: 31, fill: '#5E4635', lineHeight: 44 })}
    ${careText ? `${rect(110, 1212, 860, 66, '#FFE1EA', 30)}<text x="150" y="1254" font-size="26" fill="#B05B70" font-family="PingFang SC, Microsoft YaHei, sans-serif">生日仪式：${escapeXml(careText)}</text>` : ''}
    <text x="540" y="1350" font-size="23" fill="#9A6A35" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">适合生日纪念和朋友圈分享。</text>
    ${watermark(data)}
  `, '#FFF2D8');
}

module.exports = renderTemplate;
