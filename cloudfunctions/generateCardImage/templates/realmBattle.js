const { escapeXml, textBlock, rect, imageBlock, statusTags, watermark, svgRoot, safeDate } = require('./shared');

function renderTemplate(data) {
  const image = data.imageDataUris && data.imageDataUris[0];
  const level = Number(data.petLevel || data.level || 1);
  const exp = Number(data.petExp || data.exp || 0);
  const next = Number(data.petNextLevelExp || data.nextLevelExp || 100);
  const progress = Math.max(28, Math.min(760, Math.round((exp / Math.max(1, next)) * 760)));

  return svgRoot(`
    <defs>
      <linearGradient id="realmBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFF4D6"/>
        <stop offset="100%" stop-color="#FFE2A8"/>
      </linearGradient>
    </defs>
    ${rect(0, 0, 1080, 1440, 'url(#realmBg)')}
    <circle cx="540" cy="455" r="310" fill="rgba(255,255,255,0.34)"/>
    <circle cx="540" cy="455" r="225" fill="none" stroke="#D09A2D" stroke-width="5" stroke-dasharray="18 16"/>
    ${rect(76, 76, 928, 1288, 'rgba(255,253,246,0.82)', 40, 'stroke="#D09A2D" stroke-width="4"')}
    <text x="540" y="130" font-size="66" font-weight="900" fill="#7A4F12" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">今日灵宠修行录</text>
    <text x="540" y="180" font-size="28" fill="#8C6731" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">今日灵气已入体，毛孩子正在悄悄变强</text>
    ${imageBlock(image, 330, 235, 420, 420, { radius: 210, bg: '#FFF7DE', title: '灵宠头像', fit: 'meet', stroke: '#A87114', strokeWidth: 8 })}
    ${rect(120, 715, 840, 138, '#FFF1BE', 30)}
    <text x="154" y="770" font-size="38" font-weight="900" fill="#7A4F12" font-family="PingFang SC, Microsoft YaHei, sans-serif">Lv.${level} · ${escapeXml(data.petRealm || data.realm || '初灵觉醒')}</text>
    <text x="154" y="812" font-size="26" fill="#8C6731" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(data.petTitle || data.title || '刚入门的小灵宠')}</text>
    ${rect(154, 828, 760, 18, '#E9C46A', 9)}
    ${rect(154, 828, progress, 18, '#A87114', 9)}
    ${statusTags(data, 120, 905, { width: 390, height: 58, gapX: 40, gapY: 24, fill: '#FFF8DF', labelFill: '#9B7132', valueFill: '#4E3514' })}
    ${rect(120, 1174, 840, 112, '#FFFDF6', 28)}
    ${textBlock(data.dailyNote || '今日修行顺利。', 154, 1226, { maxChars: 26, maxLines: 2, size: 29, fill: '#4E3514', lineHeight: 38 })}
    <text x="540" y="1352" font-size="22" fill="#7A633E" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">本功能为趣味成长记录，不代表宠物健康状态。</text>
    ${watermark(data)}
  `, '#FFF4D6');
}

module.exports = renderTemplate;
