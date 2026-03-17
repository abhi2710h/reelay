const Reel = require('../models/Reel');
const User = require('../models/User');

exports.getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(req.user._id);
    const following = currentUser.following || [];

    const publicCreators = await User.find({ isPrivate: false, _id: { $ne: req.user._id } }).select('_id');
    const publicCreatorIds = publicCreators.map(u => u._id);

    const allAllowedCreators = [...new Set([...following.map(String), ...publicCreatorIds.map(String)])];

    const total = await Reel.countDocuments({
      creator: { $in: allAllowedCreators },
      isRemoved: false,
      isPublic: true
    });

    const reels = await Reel.find({
      creator: { $in: allAllowedCreators },
      isRemoved: false,
      isPublic: true
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('creator', 'username avatar isVerified isPrivate followers');

    res.json({ reels, page, hasMore: skip + reels.length < total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTrending = async (req, res) => {
  try {
    const publicCreators = await User.find({ isPrivate: false }).select('_id');
    const publicCreatorIds = publicCreators.map(u => u._id);

    const reels = await Reel.find({ creator: { $in: publicCreatorIds }, isRemoved: false, isPublic: true })
      .sort({ trendingScore: -1 })
      .limit(20)
      .populate('creator', 'username avatar isVerified');
    res.json(reels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
