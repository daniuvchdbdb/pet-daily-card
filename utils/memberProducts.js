const MEMBER_PRODUCTS = [
  {
    productId: 'plus_month',
    plan: 'plus',
    name: 'Plus 月度服务',
    durationText: '30 天',
    priceText: '¥9.9',
    amount: 990,
    description: '高级主题、无水印日报卡、成长记录增强功能',
    features: ['高级主题皮肤', '无水印日报卡', '更多宠物档案', '更多养护提醒', '成长相册增强', '历史记录长期保存']
  },
  {
    productId: 'plus_year',
    plan: 'plus',
    name: 'Plus 年度服务',
    durationText: '365 天',
    priceText: '¥49',
    amount: 4900,
    description: '一年内使用高级主题、无水印日报卡和成长记录增强功能',
    features: ['Plus 全部权益', '一年服务有效期', '高级主题皮肤', '无水印保存', '长期历史记录']
  },
  {
    productId: 'pro_month',
    plan: 'pro',
    name: 'Pro 月度服务',
    durationText: '30 天',
    priceText: '¥19.9',
    amount: 1990,
    description: '自定义主题、高清导出、成长手册和纪念主题',
    features: ['包含 Plus 全部权益', '自定义主题', '高清日报导出', '成长手册生成', '生日纪念主题', '灵宠成长展示主题']
  },
  {
    productId: 'pro_year',
    plan: 'pro',
    name: 'Pro 年度服务',
    durationText: '365 天',
    priceText: '¥99',
    amount: 9900,
    description: '一年内使用全部高级主题、自定义主题和成长手册功能',
    features: ['Pro 全部权益', '一年服务有效期', '自定义主题', '纪念主题', '成长手册', '高清导出']
  }
];

function getMemberProduct(productId) {
  return MEMBER_PRODUCTS.find((item) => item.productId === productId) || MEMBER_PRODUCTS[0];
}

module.exports = {
  MEMBER_PRODUCTS,
  getMemberProduct
};
