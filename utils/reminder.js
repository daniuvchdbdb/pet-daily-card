const { REMINDER_TYPES, HEALTH_REMINDER_DETAIL } = require('./constants');

function mergeDateAndTime(dateText, timeText) {
  const date = dateText || new Date().toISOString().slice(0, 10);
  const time = timeText || '09:00';
  return new Date(`${date}T${time}:00`);
}

function calculateNextRunAt(reminder, fromDate = new Date()) {
  const repeatType = reminder.repeatType || 'once';
  let next = mergeDateAndTime(reminder.remindDate, reminder.remindTime);
  const from = new Date(fromDate);

  if (repeatType === 'once') {
    return next;
  }

  while (next <= from) {
    if (repeatType === 'daily') {
      next.setDate(next.getDate() + 1);
    } else if (repeatType === 'weekly') {
      next = nextWeeklyDate(next, reminder.weekdays, from);
    } else if (repeatType === 'monthly') {
      next.setMonth(next.getMonth() + 1);
    } else if (repeatType === 'every_n_days') {
      next.setDate(next.getDate() + Number(reminder.intervalDays || 1));
    } else if (repeatType === 'yearly') {
      next.setFullYear(next.getFullYear() + 1);
    } else {
      break;
    }
  }

  return next;
}

function nextWeeklyDate(current, weekdays = [], from) {
  const selected = weekdays.length ? weekdays.map(Number) : [current.getDay()];
  const next = new Date(current);
  for (let i = 1; i <= 14; i += 1) {
    next.setDate(current.getDate() + i);
    if (selected.includes(next.getDay()) && next > from) return next;
  }
  next.setDate(current.getDate() + 7);
  return next;
}

function getReminderType(type) {
  return REMINDER_TYPES.find((item) => item.key === type) || REMINDER_TYPES[0];
}

function isHealthReminder(type) {
  return !!getReminderType(type).health;
}

function healthReminderTip(type) {
  return isHealthReminder(type) ? HEALTH_REMINDER_DETAIL : '';
}

module.exports = {
  calculateNextRunAt,
  getReminderType,
  isHealthReminder,
  healthReminderTip
};
