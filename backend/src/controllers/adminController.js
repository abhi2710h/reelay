const User = require('../models/User');
const Reel = require('../models/Reel');
const Notification = require('../models/Notification');

exports.getDashboardStats = async (req, res) => {
  const [totalUsers, totalReels, reportedReels, newUsersToday] = await Promise.all([
    User.countDocuments({ isBanned: false }),
    Reel.countDocuments({ isRemoved: false }),
    Reel.countDocuments({ 'reports.0': { $exists: true }, isRemoved: false }),
    User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
  ]);

  const topReels = await Reel.find({ isRemoved: false })
    .sort({ views: -1 })
    .limit(5)
    .populate('creator', 'username avatar');

  const userGrowth = await User.aggregate([
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
    { $limit: 30 }
  ]);

  res.json({ totalUsers, totalReels, reportedReels, newUsersToday, topReels, userGrowth });
};

exports.getUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';

  const query = search ? { $or: [{ username: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};
  const users = await User.find(query).select('-password -refreshTokens').skip(skip).limit(limit).sort({ createdAt: -1 });
  const total = await User.countDocuments(query);

  res.json({ users, total, page, pages: Math.ceil(total / limit) });
};

exports.banUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBanned: req.body.ban }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

exports.getReportedReels = async (req, res) => {
  const reels = await Reel.find({ 'reports.0': { $exists: true }, isRemoved: false })
    .populate('creator', 'username avatar')
    .populate('reports.user', 'username')
    .sort({ 'reports.length': -1 });
  res.json(reels);
};

exports.removeReel = async (req, res) => {
  const reel = await Reel.findByIdAndUpdate(req.params.id, { isRemoved: true }, { new: true });
  if (!reel) return res.status(404).json({ message: 'Reel not found' });
  res.json({ message: 'Reel removed' });
};

exports.makeAdmin = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isAdmin: req.body.isAdmin }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};
