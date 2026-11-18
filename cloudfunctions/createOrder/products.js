const PRODUCTS = [
  {
    productId: 'plus_month',
    name: 'Plus 月度服务',
    type: 'membership',
    plan: 'plus',
    amount: 990,
    durationDays: 30,
    description: '高级主题、无水印日报卡、成长记录增强功能'
  },
  {
    productId: 'plus_year',
    name: 'Plus 年度服务',
    type: 'membership',
    plan: 'plus',
    amount: 4900,
    durationDays: 365,
    description: '一年内使用高级主题、无水印日报卡和成长记录增强功能'
  },
  {
    productId: 'pro_month',
    name: 'Pro 月度服务',
    type: 'membership',
    plan: 'pro',
    amount: 1990,
    durationDays: 30,
    description: '自定义主题、高清导出、成长手册和纪念主题'
  },
  {
    productId: 'pro_year',
    name: 'Pro 年度服务',
    type: 'membership',
    plan: 'pro',
    amount: 9900,
    durationDays: 365,
    description: '一年内使用全部高级主题、自定义主题和成长手册功能'
  }
];

function getProduct(productId) {
  return PRODUCTS.find((item) => item.productId === productId);
}

module.exports = {
  PRODUCTS,
  getProduct
};
