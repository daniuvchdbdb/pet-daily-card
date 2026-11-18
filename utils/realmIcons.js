const REALM_ICON_STYLE_PROMPT = '为微信小程序《毛孩日报》设计一组灵宠修行境界图标。整体风格要求：国风玄幻、精致炫酷、可爱但不幼稚、带轻微游戏 UI 徽章质感。图标为正方形 1:1 构图，适合作为小程序内小尺寸图标使用。整体视觉要高辨识度、中心聚焦强、轮廓清晰、细节精致，图标主体尽量居中，背景简洁。每个图标像发光徽记或境界徽章，有柔和灵气光效、轻微粒子、能量环、灵纹、星点或符文装饰。图标边缘可有金属描边或灵力边框，整体要有层次感、立体感和光泽感。风格统一，避免血腥、暗黑、恐怖风格。';

const REALM_ICONS = [
  {
    realm: '初灵觉醒',
    levelRange: '1-5',
    minLevel: 1,
    maxLevel: 5,
    description: '毛孩子体内第一缕灵气苏醒，正式踏上修行之路。',
    title: '刚入门的小灵宠',
    iconName: '灵芽爪印',
    iconEmoji: '🐾✨',
    iconType: 'realm_chuling',
    iconColor: '#F6C85F',
    image: '/assets/realm-icons/realm_chuling.png',
    iconPrompt: '设计“初灵觉醒”境界图标。主体是一枚发光的小爪印徽记，中央是圆润可爱的宠物爪印，外圈有柔和灵气光环与细小光点，像第一缕灵气刚刚苏醒。主色调为奶油金、浅暖黄、柔和白金。'
  },
  {
    realm: '聚灵幼兽',
    levelRange: '6-10',
    minLevel: 6,
    maxLevel: 10,
    description: '每天吃饭、睡觉、撒娇，都是在暗中吸收天地灵气。',
    title: '会聚气的小毛团',
    iconName: '聚灵团子',
    iconEmoji: '🌀🐾',
    iconType: 'realm_juling',
    iconColor: '#F4A261',
    image: '/assets/realm-icons/realm_juling.png',
    iconPrompt: '设计“聚灵幼兽”境界图标。主体是一颗被灵气包裹的小兽灵核或小毛球徽记，外圈有旋转气流、灵雾和细小能量环，表现灵气逐渐汇聚。主色调为暖橙、浅金、柔和琥珀色。'
  },
  {
    realm: '灵脉初开',
    levelRange: '11-20',
    minLevel: 11,
    maxLevel: 20,
    description: '灵脉微启，眼神中已隐隐有了支配铲屎官的威压。',
    title: '灵纹初现的小尊者',
    iconName: '灵纹之眼',
    iconEmoji: '👁️✨',
    iconType: 'realm_lingmai',
    iconColor: '#F2A65A',
    image: '/assets/realm-icons/realm_lingmai.png',
    iconPrompt: '设计“灵脉初开”境界图标。主体是一枚带灵纹结构的徽章，中间是一只微微发光的小兽之眼或抽象爪印核心，周围有像灵脉般延展的发光纹路。主色调为金橙、米白、浅琥珀。'
  },
  {
    realm: '玄爪凝气',
    levelRange: '21-30',
    minLevel: 21,
    maxLevel: 30,
    description: '爪爪蕴灵，轻轻一拍，便能让铲屎官心甘情愿投喂。',
    title: '爪印凝气的小霸王',
    iconName: '玄爪印记',
    iconEmoji: '🐾🔥',
    iconType: 'realm_xuanzhua',
    iconColor: '#E76F51',
    image: '/assets/realm-icons/realm_xuanzhua.png',
    iconPrompt: '设计“玄爪凝气”境界图标。主体是锐利但圆润的灵气爪印徽章，爪印像由能量凝聚形成，周围环绕气旋和符文碎光。主色调为金橙、赤金、暖琥珀色。'
  },
  {
    realm: '御风灵兽',
    levelRange: '31-40',
    minLevel: 31,
    maxLevel: 40,
    description: '身形灵动，来去如风，拆家与卖萌皆入化境。',
    title: '踏风而行的小灵兽',
    iconName: '御风羽纹',
    iconEmoji: '🍃🐾',
    iconType: 'realm_yufeng',
    iconColor: '#84A59D',
    image: '/assets/realm-icons/realm_yufeng.png',
    iconPrompt: '设计“御风灵兽”境界图标。主体是融合爪印与风羽纹理的灵徽，外圈有流动风纹、旋风轨迹和轻盈灵光，表现御风而行、灵动迅捷。主色调为浅金、风青、淡青白。'
  },
  {
    realm: '星纹觉醒',
    levelRange: '41-50',
    minLevel: 41,
    maxLevel: 50,
    description: '额间星纹初现，已不再是普通毛孩子，而是家中小小尊者。',
    title: '星纹初醒的小尊者',
    iconName: '星纹印',
    iconEmoji: '⭐🐾',
    iconType: 'realm_xingwen',
    iconColor: '#FFD166',
    image: '/assets/realm-icons/realm_xingwen.png',
    iconPrompt: '设计“星纹觉醒”境界图标。主体是以星纹为核心的灵兽徽章，中间是发光爪印或兽纹核心，外围是星轨圆环与灵阵纹路，点缀细小星点和晶辉。主色调为金黄、星白、浅橙金。'
  },
  {
    realm: '月影灵君',
    levelRange: '51-60',
    minLevel: 51,
    maxLevel: 60,
    description: '踏月而行，影随心动，一声轻叫便能号令全家。',
    title: '月下巡游的小灵君',
    iconName: '月影灵轮',
    iconEmoji: '🌙🐾',
    iconType: 'realm_yueying',
    iconColor: '#CDB4DB',
    image: '/assets/realm-icons/realm_yueying.png',
    iconPrompt: '设计“月影灵君”境界图标。主体是弯月与爪印融合的月影灵徽，中央可见月弧包裹发光爪印，外圈有月华光晕、灵雾和柔和符纹。主色调为月白、浅银金、暖白金。'
  },
  {
    realm: '九曜仙宠',
    levelRange: '61-70',
    minLevel: 61,
    maxLevel: 70,
    description: '九曜灵光护体，撒娇时可乱人心神，卖萌时可破万法。',
    title: '九曜护体的小仙宠',
    iconName: '九曜灵环',
    iconEmoji: '☀️✨',
    iconType: 'realm_jiuyao',
    iconColor: '#FFB703',
    image: '/assets/realm-icons/realm_jiuyao.png',
    iconPrompt: '设计“九曜仙宠”境界图标。主体是中心爪印灵核，外部由九个发光小曜点组成环状仙阵，九曜围绕中心旋转，搭配灵力光环和细小符纹。主色调为金白、浅橙金、暖日光色。'
  },
  {
    realm: '天玄兽主',
    levelRange: '71-80',
    minLevel: 71,
    maxLevel: 80,
    description: '灵威渐成，已具兽主之姿，家中地位无人可撼。',
    title: '家中登基的小兽主',
    iconName: '天玄兽印',
    iconEmoji: '👑🐾',
    iconType: 'realm_tianxuan',
    iconColor: '#E9C46A',
    image: '/assets/realm-icons/realm_tianxuan.png',
    iconPrompt: '设计“天玄兽主”境界图标。主体是庄重而炫酷的兽主徽章，中间是尊贵发光的兽爪印记或兽首抽象纹章，外围有玄纹、王冠状灵环和层叠能量边框。主色调为深金、暖橙金、象牙白。'
  },
  {
    realm: '万象神兽',
    levelRange: '81-90',
    minLevel: 81,
    maxLevel: 90,
    description: '万象归一，灵气浩荡，举手投足皆是传说。',
    title: '万象归一的神兽幼崽',
    iconName: '万象灵阵',
    iconEmoji: '🔆🐾',
    iconType: 'realm_wanxiang',
    iconColor: '#F77F00',
    image: '/assets/realm-icons/realm_wanxiang.png',
    iconPrompt: '设计“万象神兽”境界图标。主体是多层灵阵与神兽爪印结合的高阶徽章，中央为强烈发光核心，外围有多重环状结构、星点、符文、能量流和灵阵碎光。主色调为金橙、星辉白、圣金色。'
  },
  {
    realm: '太古圣灵',
    levelRange: '91-99',
    minLevel: 91,
    maxLevel: 99,
    description: '来自太古传说中的至高灵宠，陪伴本身便是一场奇迹。',
    title: '太古传说中的圣灵宠',
    iconName: '太古圣印',
    iconEmoji: '🛡️🐾',
    iconType: 'realm_taigu',
    iconColor: '#F1E9DA',
    image: '/assets/realm-icons/realm_taigu.png',
    iconPrompt: '设计“太古圣灵”境界图标。主体是太古圣印风格的灵宠徽章，中央是古老神圣的爪印或圣灵核心，外围有古纹、圣环、灵阵浮雕和岁月感符文。主色调为圣金、象牙白、暖白辉光。'
  },
  {
    realm: '天命毛神',
    levelRange: '100',
    minLevel: 100,
    maxLevel: 100,
    description: '天地认证，万宠朝拜，传说中的终极毛孩子，家里真正的主人。',
    title: '登临天命的终极毛神',
    iconName: '天命神徽',
    iconEmoji: '👑✨🐾',
    iconType: 'realm_tianming',
    iconColor: '#FFF1A8',
    image: '/assets/realm-icons/realm_tianming.png',
    iconPrompt: '设计“天命毛神”境界图标。主体是终极神徽，融合王冠、神环、爪印、星纹、灵阵、光翼等元素，中心是最醒目的神圣爪印核心，外圈有多层辉光和庄严灵阵。主色调为神圣金、暖白、星辉白、少量虹彩金属感。'
  }
];

function getRealmByLevel(level = 1) {
  const safeLevel = Math.max(1, Math.min(100, Number(level) || 1));
  return REALM_ICONS.find((item) => safeLevel >= item.minLevel && safeLevel <= item.maxLevel) || REALM_ICONS[0];
}

module.exports = {
  REALM_ICON_STYLE_PROMPT,
  REALM_ICONS,
  getRealmByLevel
};
