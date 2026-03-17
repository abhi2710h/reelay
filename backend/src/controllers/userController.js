const User = require('../models/User');
const Reel = require('../models/Reel');
const { createNotification } = require('../utils/notifications');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -refreshTokens -passwordResetToken -passwordResetExpires')
      .populate('followers', 'username avatar isOnline settings')
      .populate('following', 'username avatar isOnline settings')
      .populate('followRequests', 'username avatar');

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isOwn = req.user._id.toString() === user._id.toString();
    const isFollower = user.followers.some(f => f._id.toString() === req.user._id.toString());
    const hasRequested = user.followRequests.some(r => r._id.toString() === req.user._id.toString());

    const profileData = user.toObject();

    if (!isOwn && user.settings?.showOnlineStatus === false) {
      profileData.isOnline = undefined;
      profileData.lastSeen = undefined;
    }

    if (!isOwn && user.isPrivate && !isFollower) {
      return res.json({
        ...profileData,
        followers: user.followers.length,
        following: user.following.length,
        followRequests: undefined,
        isPrivate: true,
        isLocked: true,
        hasRequested
      });
    }

    res.json({ ...profileData, isFollower, hasRequested });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, bio, website, isPrivate } = req.body;
    const update = { fullName, bio, website, isPrivate };
    if (req.file) update.avatar = req.file.path;

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true })
      .select('-password -refreshTokens');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { showOnlineStatus, allowMessages, showActivity, emailNotifications } = req.body;
    const user = await User.findById(req.user._id);
    user.settings = {
      ...user.settings,
      ...(showOnlineStatus !== undefined && { showOnlineStatus }),
      ...(allowMessages !== undefined && { allowMessages }),
      ...(showActivity !== undefined && { showActivity }),
      ...(emailNotifications !== undefined && { emailNotifications }),
    };
    await user.save();
    res.json({ settings: user.settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user._id.toString())
      return res.status(400).json({ message: 'Cannot follow yourself' });

    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: 'User not found' });

    const isFollowing = target.followers.some(f => f.toString() === req.user._id.toString());
    const hasRequested = target.followRequests.some(r => r.toString() === req.user._id.toString());

    if (isFollowing) {
      await User.findByIdAndUpdate(targetId, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: targetId } });
      return res.json({ status: 'unfollowed' });
    }

    if (target.isPrivate) {
      if (hasRequested) {
        await User.findByIdAndUpdate(targetId, { $pull: { followRequests: req.user._id } });
        return res.json({ status: 'unrequested' });
      }
      await User.findByIdAndUpdate(targetId, { $addToSet: { followRequests: req.user._id } });
      const io = req.app.get('io');
      await createNotification(io, { recipient: targetId, sender: req.user._id, type: 'follow' });
      return res.json({ status: 'requested' });
    }

    await User.findByIdAndUpdate(targetId, { $addToSet: { followers: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: targetId } });
    const io = req.app.get('io');
    await createNotification(io, { recipient: targetId, sender: req.user._id, type: 'follow' });
    res.json({ status: 'following' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.handleFollowRequest = async (req, res) => {
  try {
    const { requesterId, action } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.followRequests.includes(requesterId))
      return res.status(400).json({ message: 'No such request' });

    await User.findByIdAndUpdate(req.user._id, { $pull: { followRequests: requesterId } });

    if (action === 'accept') {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { followers: requesterId } });
      await User.findByIdAndUpdate(requesterId, { $addToSet: { following: req.user._id } });
    }

    res.json({ message: action === 'accept' ? 'Request accepted' : 'Request declined' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserReels = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isOwn = req.user._id.toString() === user._id.toString();
    const isFollower = user.followers.some(f => f.toString() === req.user._id.toString());

    if (!isOwn && user.isPrivate && !isFollower) {
      return res.json([]);
    }

    const reels = await Reel.find({ creator: user._id, isRemoved: false, isPublic: true })
      .sort({ createdAt: -1 })
      .populate('creator', 'username avatar');
    res.json(reels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const users = await User.find({
      _id: { $nin: [...currentUser.following, req.user._id] },
      isBanned: false
    }).select('username fullName avatar followers isVerified isPrivate').limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.togglePrivacy = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isPrivate = !user.isPrivate;

    if (!user.isPrivate && user.followRequests.length > 0) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: { followers: { $each: user.followRequests } }
      });
      for (const requesterId of user.followRequests) {
        await User.findByIdAndUpdate(requesterId, { $addToSet: { following: req.user._id } });
      }
      user.followRequests = [];
    }

    await user.save();
    res.json({ isPrivate: user.isPrivate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFollowRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followRequests', 'username avatar fullName');
    res.json(user.followRequests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSavedReels = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedReels',
      match: { isRemoved: false },
      populate: { path: 'creator', select: 'username avatar' }
    });
    res.json(user.savedReels || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.saveReel = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const reelId = req.params.id;
    const isSaved = user.savedReels?.includes(reelId);
    if (isSaved) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { savedReels: reelId } });
      return res.json({ saved: false });
    }
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { savedReels: reelId } });
    res.json({ saved: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user._id.toString())
      return res.status(400).json({ message: 'Cannot block yourself' });

    const me = await User.findById(req.user._id);
    const isBlocked = me.blockedUsers?.some(b => b.toString() === targetId);

    if (isBlocked) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { blockedUsers: targetId } });
      return res.json({ status: 'unblocked' });
    }

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { blockedUsers: targetId } });
    await User.findByIdAndUpdate(req.user._id, { $pull: { followers: targetId, following: targetId } });
    await User.findByIdAndUpdate(targetId, { $pull: { followers: req.user._id, following: req.user._id } });
    res.json({ status: 'blocked' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('blockedUsers', 'username avatar fullName');
    res.json(user.blockedUsers || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followers', 'username avatar fullName isOnline');
    res.json(user.followers || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFollower = async (req, res) => {
  try {
    const followerId = req.params.id;
    await User.findByIdAndUpdate(req.user._id, { $pull: { followers: followerId } });
    await User.findByIdAndUpdate(followerId, { $pull: { following: req.user._id } });
    res.json({ message: 'Follower removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFollowersList = async (req, res) => {
  try {
    const target = await User.findOne({ username: req.params.username })
      .populate('followers', 'username avatar fullName isOnline')
      .populate('following', 'username avatar fullName isOnline');

    if (!target) return res.status(404).json({ message: 'User not found' });

    const isOwn = req.user._id.toString() === target._id.toString();
    const isFollower = target.followers.some(f => f._id.toString() === req.user._id.toString());

    if (!isOwn && target.isPrivate && !isFollower) {
      return res.status(403).json({ message: 'This account is private' });
    }

    const type = req.query.type === 'following' ? 'following' : 'followers';
    res.json(target[type] || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
