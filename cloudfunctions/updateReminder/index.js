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

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { id, ...patch } = event;
  if (!id) return { ok: false, message: '缺少提醒 ID' };

  const current = await db.collection('reminders').doc(id).get();
  if (current.data._openid !== OPENID) return { ok: false, message: '无权修改该提醒' };

  const merged = { ...current.data, ...patch };
  const data = {
    ...patch,
    nextRunAt: calculateNextRunAt(merged),
    updatedAt: db.serverDate()
  };
  delete data.id;
  delete data._id;
  delete data._openid;

  await db.collection('reminders').doc(id).update({ data });
  return { ok: true, nextRunAt: data.nextRunAt };
};
