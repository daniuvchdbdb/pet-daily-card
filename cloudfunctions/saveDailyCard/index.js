const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

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
  return { _id: added._id, plan: 'free' };
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const user = await getUser(OPENID);

  const data = {
    userId: user._id,
    petId: event.petId,
    petName: event.petName,
    petType: event.petType,
    images: event.images || [],
    weight: event.weight || '',
    foodStatus: event.foodStatus || '',
    waterStatus: event.waterStatus || '',
    poopStatus: event.poopStatus || '',
    moodStatus: event.moodStatus || '',
    exerciseStatus: event.exerciseStatus || '',
    emotionStatus: event.emotionStatus || '',
    dailyNote: event.dailyNote || '',
    templateId: event.templateId || 'template_cute_daily',
    templateIsPaid: false,
    cardImageUrl: event.cardImageUrl || '',
    recordDate: event.recordDate || new Date().toISOString().slice(0, 10),
    careRecords: event.careRecords || [],
    isWatermarked: false,
    createdAt: db.serverDate()
  };

  const result = await db.collection('daily_cards').add({ data });
  return { ok: true, id: result._id, isWatermarked: false };
};