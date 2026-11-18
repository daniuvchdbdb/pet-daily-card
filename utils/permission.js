const { CREATOR_OPENIDS } = require('./devConfig');
const { PLAN_LIMITS } = require('./constants');
const { getThemeById } = require('./themes');

function normalizePlan() {
  return 'free';
}

function isCreator(user = {}) {
  return user.role === 'creator' || user.role === 'admin';
}

function isCreatorOpenId(openid) {
  return !!openid && CREATOR_OPENIDS.indexOf(openid) > -1;
}

function applyCreatorOverride(user = {}) {
  const openid = user.openid || user._openid;
  return {
    role: isCreatorOpenId(openid) ? 'creator' : 'user',
    plan: 'free',
    ...user,
    planExpireAt: null
  };
}

function planRank() {
  return 0;
}

function canUseTheme() {
  return true;
}

function canSaveCustomTheme() {
  return true;
}

function canUseTemplate(user = {}, template = {}) {
  getThemeById(template.id || template.themeId || template.templateId);
  return true;
}

function getThemePaywall() {
  return {
    title: '已免费开放',
    content: '当前版本已取消会员限制，所有主题、模板和自定义功能均可免费使用。',
    confirmText: '知道了',
    cancelText: '继续使用'
  };
}

function getTemplatePaywall() {
  return getThemePaywall();
}

function getPlanLimits() {
  return PLAN_LIMITS.free;
}

function shouldAddWatermark() {
  return false;
}

function canAutoSyncReminderToDaily() {
  return true;
}

function checkLimit() {
  return { ok: true };
}

module.exports = {
  normalizePlan,
  planRank,
  isCreator,
  isCreatorOpenId,
  applyCreatorOverride,
  canUseTemplate,
  canUseTheme,
  canSaveCustomTheme,
  getThemePaywall,
  getTemplatePaywall,
  getPlanLimits,
  shouldAddWatermark,
  canAutoSyncReminderToDaily,
  checkLimit
};