const User = require('../models/User');
const Reel = require('../models/Reel');

exports.search = async (req, res) => {
  try {
    const { q, type } = req.query;
    if (!q) return res.json({ users: [], reels: [], hashtags: [] });

    const results = {};

    if (!type || type === 'users') {
      results.users = await User.find({
        $or: [{ username: { $regex: q, $options: 'i' } }, { fullName: { $regex: q, $options: 'i' } }],
        isBanned: false
      }).select('username fullName avatar followers isVerified').limit(10);
    }

    if (!type || type === 'reels') {
      results.reels = await Reel.find({
        $or: [{ caption: { $regex: q, $options: 'i' } }, { hashtags: { $regex: q, $options: 'i' } }],
        isRemoved: false, isPublic: true
      }).populate('creator', 'username avatar').limit(10);
    }

    if (!type || type === 'hashtags') {
      const hashtagReels = await Reel.aggregate([
        { $match: { isRemoved: false, isPublic: true } },
        { $unwind: '$hashtags' },
        { $match: { hashtags: { $regex: q, $options: 'i' } } },
        { $group: { _id: '$hashtags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
      results.hashtags = hashtagReels;
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTrendingHashtags = async (req, res) => {
  try {
    const trending = await Reel.aggregate([
      { $match: { isRemoved: false, isPublic: true, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $unwind: '$hashtags' },
      { $group: { _id: '$hashtags', count: { $sum: 1 }, totalLikes: { $sum: { $size: '$likes' } } } },
      { $sort: { count: -1, totalLikes: -1 } },
      { $limit: 20 }
    ]);
    res.json(trending);
  } catch (err) {
    res.json([]);
  }
};
