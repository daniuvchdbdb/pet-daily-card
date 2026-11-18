function pass() {
  return { ok: true };
}

function normalizePlan() {
  return 'free';
}

function isPaidPlan() {
  return false;
}

function getPlanLimits() {
  return {
    petLimit: Infinity,
    dailyCardLimit: Infinity,
    reminderLimit: Infinity,
    watermarked: false,
    autoSyncReminderToDaily: true
  };
}

function planRank() {
  return 0;
}

async function getCurrentPlan() {
  return 'free';
}

function checkPetLimit() {
  return pass();
}

function checkDailyCardLimit() {
  return pass();
}

function checkReminderLimit() {
  return pass();
}

function canUseTemplate() {
  return pass();
}

function shouldAddWatermark() {
  return false;
}

function canAutoSyncReminderToDaily() {
  return true;
}

function buildDailyRange() {
  const { getDayStart, getDayEnd } = require('./date');
  return {
    start: getDayStart(),
    end: getDayEnd()
  };
}

module.exports = {
  normalizePlan,
  planRank,
  getCurrentPlan,
  isPaidPlan,
  getPlanLimits,
  checkPetLimit,
  checkDailyCardLimit,
  checkReminderLimit,
  canUseTemplate,
  shouldAddWatermark,
  canAutoSyncReminderToDaily,
  buildDailyRange
};