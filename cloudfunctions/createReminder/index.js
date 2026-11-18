const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

function mergeDateAndTime(dateText, timeText) {
  return new Date(`${dateText || new Date().toISOString().slice(0, 10)}T${timeText || '09:00'}:00`);
}

function calculateNextRunAt(reminder, fromDate = new Date()) {
  const repeatType = reminder.repeatType || 'once';
  let next = mergeDateAndTime(reminder.remindDate, reminder.remindTime);
  const from = new Date(fromDate);
  if (repeatType === 'once') return next;
  while (next <= from) {
    if (repeatType === 'daily') next.setDate(next.getDate() + 1);
    else if (repeatType === 'weekly') next.setDate(next.getDate() + 7);
    else if (repeatType === 'monthly') next.setMonth(next.getMonth() + 1);
    else if (repeatType === 'every_n_days') next.setDate(next.getDate() + Number(reminder.intervalDays || 1));
    else if (repeatType === 'yearly') next.setFullYear(next.getFullYear() + 1);
    else break;
  }
  return next;
}

async function getUser(openid) {
  const result = await db.collection('users').where({ _openid: openid }).limit(1).get();
  if (result.data.length) return result.data[0];
  const added = await db.collection('users').add({
    data: {
      _openid: openid,
      plan: 'free',
      planExpireAt: null,
      unlockedTemplates: [],
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
  });
  return { _id: added._id, _openid: openid, plan: 'free' };
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const user = await getUser(OPENID);

  const data = {
    userId: user._id,
    petId: event.petId,
    petName: event.petName,
    type: event.type || 'feed',
    title: event.title || '养护提醒',
    note: event.note || '',
    enabled: !!event.enabled,
    subscribeEnabled: !!event.subscribeEnabled,
    subscribeStatus: event.subscribeStatus || 'unknown',
    repeatType: event.repeatType || 'once',
    intervalDays: Number(event.intervalDays || 1),
    remindTime: event.remindTime || '09:00',
    remindDate: event.remindDate || new Date().toISOString().slice(0, 10),
    weekdays: event.weekdays || [],
    nextRunAt: calculateNextRunAt(event),
    lastRunAt: null,
    templateId: event.templateId || '',
    autoSyncToDailyCard: true,
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  };

  const result = await db.collection('reminders').add({ data });
  return { ok: true, id: result._id, nextRunAt: data.nextRunAt };
};