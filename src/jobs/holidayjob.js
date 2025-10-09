// Placeholder for daily jobs: update holiday status, send reminders, cleanup expired OTPs etc.
const Notification = require('../models/Notification');

exports.runDailyJobs = async (io) => {
  // Example: send a daily summary notification to admins
  try {
    const notif = await Notification.create({ to: ['admin'], title: 'Daily job', body: 'Daily job executed', meta: {} });
    if (io) io.emit('notification', notif);
  } catch (err) {
    console.error('Daily job failed', err);
  }
};
