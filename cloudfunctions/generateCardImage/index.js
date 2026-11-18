const cloud = require('wx-server-sdk');
const zlib = require('zlib');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const TEMPLATE_ALIASES = {
  cream: 'template_cute_daily',
  clean: 'template_simple_record',
  storybook: 'template_xhs_share',
  'no-watermark': 'template_xhs_share',
  template_cute: 'template_cute_daily',
  template_simple: 'template_simple_record',
  template_xhs: 'template_xhs_share',
  template_realm: 'template_realm_battle'
};

const SUPPORTED_TEMPLATE_IDS = [
  'template_cute_daily',
  'template_simple_record',
  'template_xhs_share',
  'template_sticker_diary',
  'template_growth_album',
  'template_multi_pet',
  'template_realm_battle',
  'template_birthday_ceremony',
  'template_home_anniversary',
  'template_festival_limited',
  'template_tianming_god'
];

const TEMPLATE_THEMES = {
  template_cute_daily: {
    name: '\u5976\u6cb9\u65e5\u5e38\u98ce',
    bg: [255, 247, 232, 255],
    accent: [255, 166, 76, 255],
    soft: [255, 225, 176, 255]
  },
  template_simple_record: {
    name: '\u7b80\u6d01\u8bb0\u5f55\u98ce',
    bg: [248, 248, 248, 255],
    accent: [70, 70, 70, 255],
    soft: [226, 226, 226, 255]
  },
  template_xhs_share: {
    name: '\u5c0f\u7ea2\u4e66\u6652\u5ba0\u98ce',
    bg: [255, 241, 244, 255],
    accent: [255, 122, 154, 255],
    soft: [255, 214, 226, 255]
  },
  template_sticker_diary: {
    name: '\u624b\u8d26\u8d34\u7eb8\u98ce',
    bg: [255, 244, 214, 255],
    accent: [255, 187, 92, 255],
    soft: [255, 230, 148, 255]
  },
  template_realm_battle: {
    name: '\u7075\u5ba0\u4fee\u884c\u6218\u529b\u5361',
    bg: [255, 232, 174, 255],
    accent: [181, 122, 18, 255],
    soft: [255, 247, 214, 255]
  },
  template_birthday_ceremony: {
    name: '\u751f\u65e5\u7eaa\u5ff5\u5361',
    bg: [255, 241, 210, 255],
    accent: [255, 142, 94, 255],
    soft: [255, 213, 122, 255]
  },
  template_home_anniversary: {
    name: '\u5230\u5bb6\u7eaa\u5ff5\u65e5\u5361',
    bg: [255, 238, 222, 255],
    accent: [226, 126, 90, 255],
    soft: [255, 217, 194, 255]
  },
  template_festival_limited: {
    name: '\u8282\u65e5\u9650\u5b9a\u5361',
    bg: [255, 245, 232, 255],
    accent: [211, 64, 54, 255],
    soft: [255, 211, 128, 255]
  },
  template_tianming_god: {
    name: '\u5929\u547d\u6bdb\u795e\u7ec8\u6781\u5361',
    bg: [255, 246, 210, 255],
    accent: [176, 112, 0, 255],
    soft: [255, 226, 122, 255]
  }
};

function normalizeTemplateId(templateId) {
  const normalized = TEMPLATE_ALIASES[templateId] || templateId || 'template_cute_daily';
  return SUPPORTED_TEMPLATE_IDS.indexOf(normalized) > -1 ? normalized : 'template_cute_daily';
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const lengthBuffer = Buffer.alloc(4);
  const crcBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(data.length, 0);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer]);
}

function createSolidPng({ templateId }) {
  const width = 720;
  const height = 960;
  const theme = TEMPLATE_THEMES[templateId] || TEMPLATE_THEMES.template_cute_daily;
  const raw = Buffer.alloc((width * 4 + 1) * height);

  function setPixel(x, y, color) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const offset = y * (width * 4 + 1) + 1 + x * 4;
    raw[offset] = color[0];
    raw[offset + 1] = color[1];
    raw[offset + 2] = color[2];
    raw[offset + 3] = color[3];
  }

  function fillRect(x, y, rectWidth, rectHeight, color) {
    const startX = Math.max(0, x);
    const startY = Math.max(0, y);
    const endX = Math.min(width, x + rectWidth);
    const endY = Math.min(height, y + rectHeight);
    for (let yy = startY; yy < endY; yy += 1) {
      for (let xx = startX; xx < endX; xx += 1) {
        setPixel(xx, yy, color);
      }
    }
  }

  function fillCircle(cx, cy, radius, color) {
    const radiusSq = radius * radius;
    for (let y = cy - radius; y <= cy + radius; y += 1) {
      for (let x = cx - radius; x <= cx + radius; x += 1) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= radiusSq) setPixel(x, y, color);
      }
    }
  }

  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 4 + 1)] = 0;
    for (let x = 0; x < width; x += 1) {
      setPixel(x, y, theme.bg);
    }
  }

  fillRect(64, 72, 592, 792, [255, 255, 255, 255]);
  fillRect(104, 132, 280, 36, theme.accent);
  fillRect(104, 202, 512, 318, theme.soft);
  fillRect(128, 226, 464, 270, [245, 245, 240, 255]);
  fillRect(104, 558, 180, 44, theme.accent);
  fillRect(308, 558, 160, 44, theme.soft);
  fillRect(104, 632, 512, 20, theme.soft);
  fillRect(104, 680, 408, 20, theme.soft);
  fillRect(104, 728, 460, 20, theme.soft);
  fillRect(104, 800, 250, 28, theme.accent);

  fillCircle(572, 138, 20, theme.soft);
  fillCircle(612, 158, 12, theme.accent);
  fillCircle(536, 174, 10, theme.accent);

  if (templateId === 'template_xhs_share' || templateId === 'template_sticker_diary') {
    fillRect(88, 188, 138, 28, theme.accent);
    fillRect(490, 496, 110, 28, theme.accent);
    fillCircle(142, 548, 22, theme.accent);
    fillCircle(576, 626, 18, theme.soft);
  }

  if (templateId === 'template_realm_battle' || templateId === 'template_tianming_god') {
    fillCircle(360, 360, 170, [255, 247, 214, 255]);
    fillCircle(360, 360, 128, theme.soft);
    fillRect(160, 620, 400, 34, theme.accent);
    fillRect(160, 666, 300, 22, theme.soft);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

exports.main = async (event = {}) => {
  console.log('[generateCardImage] function start');
  console.log('[generateCardImage] event:', JSON.stringify(event));

  try {
    console.log('[generateCardImage] \u6536\u5230 templateId:', event.templateId);
    const templateId = normalizeTemplateId(event.templateId);
    console.log('[generateCardImage] \u5b9e\u9645\u4f7f\u7528 templateId:', templateId);

    const wxContext = cloud.getWXContext();
    const safeUserId = String(event.userId || wxContext.OPENID || 'anonymous').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileContent = createSolidPng({ templateId });
    const cloudPath = `cards-test/${safeUserId}/${Date.now()}-${templateId}.png`;
    const uploadResult = await cloud.uploadFile({ cloudPath, fileContent });
    const fileID = uploadResult.fileID;

    let cardImageUrl = fileID;
    try {
      const tempUrlResult = await cloud.getTempFileURL({ fileList: [fileID] });
      const firstFile = tempUrlResult.fileList && tempUrlResult.fileList[0];
      if (firstFile && firstFile.tempFileURL) {
        cardImageUrl = firstFile.tempFileURL;
      }
    } catch (urlErr) {
      console.warn('[generateCardImage] \u83b7\u53d6\u4e34\u65f6\u94fe\u63a5\u5931\u8d25\uff0c\u524d\u7aef\u5c06\u4f7f\u7528 fileID:', urlErr);
    }

    return {
      success: true,
      cardImageUrl,
      fileID,
      templateId,
      templateName: (TEMPLATE_THEMES[templateId] || TEMPLATE_THEMES.template_cute_daily).name,
      outputType: 'png',
      message: 'generateCardImage \u6700\u5c0f\u6d4b\u8bd5 PNG \u6267\u884c\u6210\u529f'
    };
  } catch (err) {
    console.error('[generateCardImage] \u751f\u6210\u5931\u8d25:', err);
    return {
      success: false,
      message: err && err.message ? err.message : '\u4e91\u51fd\u6570\u751f\u6210\u5931\u8d25'
    };
  }
};
