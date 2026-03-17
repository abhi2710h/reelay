const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('sender', 'username avatar')
    .populate('reel', 'videoUrl thumbnailUrl')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(notifications);
};

exports.markAllRead = async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true });
};

exports.getUnreadCount = async (req, res) => {
  const count = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
  res.json({ count });
};
