const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1440;

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text = '', maxCharsPerLine = 18, maxLines = 3) {
  const source = String(text || '');
  const lines = [];
  let line = '';

  for (let i = 0; i < source.length; i += 1) {
    line += source[i];
    if (line.length >= maxCharsPerLine) {
      lines.push(line);
      line = '';
      if (lines.length >= maxLines) break;
    }
  }

  if (line && lines.length < maxLines) lines.push(line);
  if (source.length > maxCharsPerLine * maxLines && lines.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].slice(0, Math.max(0, maxCharsPerLine - 1))}...`;
  }
  return lines.length ? lines : [''];
}

function textBlock(text, x, y, options = {}) {
  const {
    maxChars = 18,
    maxLines = 3,
    lineHeight = 38,
    size = 28,
    fill = '#333333',
    weight = 400,
    anchor = 'start',
    family = 'PingFang SC, Microsoft YaHei, sans-serif'
  } = options;
  const lines = wrapText(text, maxChars, maxLines);
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`).join('')}</text>`;
}

function rect(x, y, width, height, fill, radius = 0, extra = '') {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="${fill}" ${extra}/>`;
}

function line(x1, y1, x2, y2, stroke, width = 2, extra = '') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
}

function imageBlock(image, x, y, width, height, options = {}) {
  const {
    radius = 28,
    bg = '#F5F5F5',
    title = '照片',
    fit = 'meet',
    stroke = '',
    strokeWidth = 0,
    id = `clip_${Math.round(x)}_${Math.round(y)}_${Math.round(width)}_${Math.round(height)}`
  } = options;

  const strokeAttr = stroke ? `stroke="${stroke}" stroke-width="${strokeWidth}"` : '';
  const placeholder = `
    ${rect(x, y, width, height, bg, radius, strokeAttr)}
    <text x="${x + width / 2}" y="${y + height / 2 - 8}" font-size="34" fill="#9A7A55" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(title)}</text>
    <text x="${x + width / 2}" y="${y + height / 2 + 36}" font-size="24" fill="#B08A5A" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif">图片加载失败时显示占位</text>
  `;

  if (!image) return placeholder;

  const preserveAspectRatio = fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet';
  return `
    <defs>
      <clipPath id="${id}">
        <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" ry="${radius}"/>
      </clipPath>
    </defs>
    ${rect(x, y, width, height, bg, radius, strokeAttr)}
    <image href="${image}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="${preserveAspectRatio}" clip-path="url(#${id})"/>
  `;
}

function statusTags(data, x, y, options = {}) {
  const tags = [
    ['吃饭', data.foodStatus || '未记录'],
    ['喝水', data.waterStatus || '未记录'],
    ['便便', data.poopStatus || '未记录'],
    ['精神', data.moodStatus || '未记录'],
    ['运动', data.exerciseStatus || '未记录'],
    ['心情', data.emotionStatus || '未记录']
  ];
  if (data.weight) tags.push(['体重', `${data.weight} kg`]);

  const {
    cols = 2,
    width = 410,
    height = 58,
    gapX = 40,
    gapY = 24,
    fill = '#FFF1D8',
    labelFill = '#9A6A35',
    valueFill = '#3B3028',
    radius = 28
  } = options;

  return tags.map((item, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const tx = x + col * (width + gapX);
    const ty = y + row * (height + gapY);
    return `
      ${rect(tx, ty, width, height, fill, radius)}
      <text x="${tx + 28}" y="${ty + 38}" font-size="25" fill="${labelFill}" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(item[0])}</text>
      <text x="${tx + 126}" y="${ty + 38}" font-size="29" fill="${valueFill}" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(item[1])}</text>
    `;
  }).join('');
}

function careRecordsText(data) {
  return (data.careRecords || []).map((item) => item && (item.title || item.type)).filter(Boolean).join('、');
}

function watermark() {
  return '';
}

function svgRoot(content, background = '#FFFFFF') {
  return `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      ${rect(0, 0, CARD_WIDTH, CARD_HEIGHT, background)}
      ${content}
    </svg>
  `;
}

function safeDate(data) {
  return escapeXml((data.recordDate || new Date().toISOString().slice(0, 10)).replace(/-/g, '.'));
}

module.exports = {
  CARD_WIDTH,
  CARD_HEIGHT,
  escapeXml,
  wrapText,
  textBlock,
  rect,
  line,
  imageBlock,
  statusTags,
  careRecordsText,
  watermark,
  svgRoot,
  safeDate
};
