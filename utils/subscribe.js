const { REMINDER_TEMPLATE_ID } = require('./constants');

async function requestReminderSubscribe() {
  try {
    const result = await wx.requestSubscribeMessage({
      tmplIds: [REMINDER_TEMPLATE_ID]
    });
    const value = result[REMINDER_TEMPLATE_ID];
    if (value === 'accept') return 'accept';
    if (value === 'reject') return 'reject';
    if (value === 'ban') return 'ban';
    return 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

module.exports = {
  requestReminderSubscribe
};
