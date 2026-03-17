const Notification = require('../models/Notification');

const createNotification = async (io, { recipient, sender, type, reel, comment, message }) => {
  if (recipient.toString() === sender.toString()) return;

  const notification = await Notification.create({ recipient, sender, type, reel, comment, message });
  const populated = await notification.populate('sender', 'username avatar');

  io.to(`user:${recipient}`).emit('notification', populated);
  return notification;
};

module.exports = { createNotification };
