const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;
const REMINDER_TEMPLATE_ID = 'TODO_微信订阅消息模板ID';
const HEALTH_NOTE = '本提醒仅根据你设置的时间发送，不替代专业兽医建议。';

function formatTime(date) {
  const d = new Date(date);
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function calculateNextRunAt(reminder, fromDate = new Date()) {
  const next = new Date(reminder.nextRunAt || fromDate);
  const repeatType = reminder.repeatType || 'once';
  if (repeatType === 'daily') next.setDate(next.getDate() + 1);
  else if (repeatType === 'weekly') next.setDate(next.getDate() + 7);
  else if (repeatType === 'monthly') next.setMonth(next.getMonth() + 1);
  else if (repeatType === 'every_n_days') next.setDate(next.getDate() + Number(reminder.intervalDays || 1));
  else if (repeatType === 'yearly') next.setFullYear(next.getFullYear() + 1);
  return next;
}

function isHealth(type) {
  return type === 'deworm' || type === 'vaccine';
}

exports.main = async () => {
  const now = new Date();
  const due = await db.collection('reminders').where({
    enabled: true,
    nextRunAt: _.lte(now)
  }).limit(100).get();

  const results = [];
  for (const reminder of due.data) {
    let status = 'skipped';
    let sentAt = null;
    if (reminder.subscribeEnabled && reminder.subscribeStatus === 'accept') {
      try {
        await cloud.openapi.subscribeMessage.send({
          touser: reminder._openid,
          templateId: REMINDER_TEMPLATE_ID,
          page: `/pages/reminders/reminders?petId=${reminder.petId}`,
          data: {
            thing1: { value: reminder.title || '养护提醒' },
            thing2: { value: reminder.petName || '毛孩子' },
            time3: { value: formatTime(reminder.nextRunAt) },
            thing4: { value: isHealth(reminder.type) ? HEALTH_NOTE : (reminder.note || '请及时查看提醒') }
          }
        });
        status = 'sent';
        sentAt = db.serverDate();
      } catch (error) {
        status = 'send_failed';
      }
    }

    await db.collection('reminder_logs').add({
      data: {
        userId: reminder.userId,
        petId: reminder.petId,
        reminderId: reminder._id,
        type: reminder.type,
        title: reminder.title,
        scheduledAt: reminder.nextRunAt,
        sentAt,
        completedAt: null,
        status,
        createdAt: db.serverDate()
      }
    });

    const update = {
      lastRunAt: reminder.nextRunAt,
      updatedAt: db.serverDate()
    };
    if (reminder.repeatType === 'once') {
      update.enabled = false;
    } else {
      update.nextRunAt = calculateNextRunAt(reminder, now);
    }
    await db.collection('reminders').doc(reminder._id).update({ data: update });
    results.push({ id: reminder._id, status });
  }

  return { ok: true, total: results.length, results };
};
