function pad(value) {
  return value < 10 ? `0${value}` : `${value}`;
}

function toDate(value) {
  if (!value) return new Date();
  return value instanceof Date ? value : new Date(value);
}

function formatDate(value = new Date(), withTime = false) {
  const date = toDate(value);
  const text = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  if (!withTime) return text;
  return `${text} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function calculateAge(birthday) {
  if (!birthday) return '';
  const birth = new Date(birthday);
  if (Number.isNaN(birth.getTime())) return '';
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years <= 0) return `${Math.max(months, 0)}个月`;
  return `${years}岁${months ? `${months}个月` : ''}`;
}

function getDayStart(value = new Date()) {
  const date = toDate(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getDayEnd(value = new Date()) {
  const date = toDate(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

function getContinuousRecordDays(cards = []) {
  const dates = [...new Set(cards.map((card) => formatDate(card.recordDate || card.createdAt)))].sort().reverse();
  if (!dates.length) return 0;
  let count = 0;
  const cursor = getDayStart();
  for (const item of dates) {
    if (item === formatDate(cursor)) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (count > 0) {
      break;
    }
  }
  return count;
}

module.exports = {
  formatDate,
  calculateAge,
  getDayStart,
  getDayEnd,
  getContinuousRecordDays
};
