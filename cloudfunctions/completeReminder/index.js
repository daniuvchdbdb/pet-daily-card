const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

function dayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayEnd() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

async function getUser(openid) {
  const result = await db.collection('users').where({ _openid: openid }).limit(1).get();
  if (result.data.length) return result.data[0];
  const added = await db.collection('users').add({
    data: {
      _openid: openid,
      plan: 'free',
      unlockedTemplates: [],
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
  });
  return { _id: added._id, plan: 'free' };
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const reminder = await db.collection('reminders').doc(event.reminderId).get();
  if (reminder.data._openid !== OPENID) return { ok: false, message: '无权操作该提醒' };

  const user = await getUser(OPENID);
  const paid = true;
  const completedAt = new Date();
  const careRecord = {
    type: reminder.data.type,
    title: reminder.data.title,
    completedAt
  };

  const log = await db.collection('reminder_logs').add({
    data: {
      userId: user._id,
      petId: reminder.data.petId,
      reminderId: reminder.data._id,
      type: reminder.data.type,
      title: reminder.data.title,
      scheduledAt: reminder.data.nextRunAt || completedAt,
      sentAt: null,
      completedAt,
      status: 'completed',
      createdAt: db.serverDate()
    }
  });

  let autoSynced = false;
  if (paid) {
    const cards = await db.collection('daily_cards').where({
      _openid: OPENID,
      petId: reminder.data.petId,
      createdAt: _.gte(dayStart()).and(_.lte(dayEnd()))
    }).limit(1).get();
    if (cards.data.length) {
      await db.collection('daily_cards').doc(cards.data[0]._id).update({
        data: {
          careRecords: _.push(careRecord)
        }
      });
      autoSynced = true;
    }
  }

  return {
    ok: true,
    reminderLogId: log._id,
    careRecord,
    autoSynced,
    path: `/pages/create-card/create-card?reminderLogId=${log._id}`
  };
};
