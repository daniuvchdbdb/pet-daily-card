async function createMembershipOrder() {
  return {
    ok: false,
    code: 'MEMBERSHIP_REMOVED',
    message: '会员系统已移除，当前版本全部功能免费开放，无需创建订单。'
  };
}

function requestWechatPayment() {
  return Promise.reject(new Error('会员系统已移除，当前版本不会发起微信支付。'));
}

async function confirmOrderUntilSettled() {
  return {
    ok: false,
    code: 'MEMBERSHIP_REMOVED',
    message: '会员系统已移除，当前版本全部功能免费开放。'
  };
}

module.exports = {
  createMembershipOrder,
  requestWechatPayment,
  confirmOrderUntilSettled
};