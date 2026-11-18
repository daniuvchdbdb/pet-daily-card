const { escapeXml, textBlock, rect, line, imageBlock, watermark, svgRoot, safeDate } = require('./shared');

function renderTemplate(data) {
  const image = data.imageDataUris && data.imageDataUris[0];
  const rows = [
    ['吃饭情况', data.foodStatus || '未记录'],
    ['喝水情况', data.waterStatus || '未记录'],
    ['便便情况', data.poopStatus || '未记录'],
    ['精神状态', data.moodStatus || '未记录'],
    ['运动情况', data.exerciseStatus || '未记录'],
    ['今日心情', data.emotionStatus || '未记录'],
    ['体重记录', data.weight ? `${data.weight} kg` : '未记录']
  ];

  return svgRoot(`
    ${rect(0, 0, 1080, 210, '#F7F7F7')}
    <text x="90" y="118" font-size="58" font-weight="800" fill="#111111" font-family="PingFang SC, Microsoft YaHei, sans-serif">宠物日常观察记录</text>
    <text x="90" y="168" font-size="28" fill="#555555" font-family="PingFang SC, Microsoft YaHei, sans-serif">${safeDate(data)} / ${escapeXml(data.petName || '毛孩子')} / ${escapeXml(data.petType || '宠物')}</text>
    ${imageBlock(image, 90, 250, 900, 330, { radius: 8, bg: '#F4F4F4', title: '观察照片', fit: 'meet', stroke: '#E8E8E8', strokeWidth: 2 })}
    ${line(90, 640, 990, 640, '#DDDDDD', 2)}
    ${rows.map((row, index) => {
      const y = 705 + index * 62;
      return `
        <text x="100" y="${y}" font-size="26" fill="#777777" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(row[0])}</text>
        <text x="290" y="${y}" font-size="30" fill="#222222" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(row[1])}</text>
        ${line(90, y + 24, 990, y + 24, '#EEEEEE', 2)}
      `;
    }).join('')}
    ${rect(90, 1160, 900, 135, '#FAFAFA', 8)}
    <text x="118" y="1208" font-size="30" font-weight="700" fill="#111111" font-family="PingFang SC, Microsoft YaHei, sans-serif">备注</text>
    ${textBlock(data.dailyNote || '暂无备注。', 118, 1250, { maxChars: 30, maxLines: 2, size: 28, fill: '#333333', lineHeight: 38 })}
    <text x="540" y="1350" font-size="23" fill="#999999" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">本记录仅作日常养护观察，不替代兽医诊断。</text>
    ${watermark(data, 'rgba(60,60,60,0.22)')}
  `, '#FFFFFF');
}

module.exports = renderTemplate;
