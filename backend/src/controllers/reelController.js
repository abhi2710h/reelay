const Reel = require('../models/Reel');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { createNotification } = require('../utils/notifications');

exports.uploadReel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Video file required' });
    const { caption, hashtags, duration } = req.body;
    const tags = hashtags ? hashtags.split(',').map(t => t.trim().replace('#', '').toLowerCase()) : [];
    const videoUrl = req.file.path;

    const reel = await Reel.create({
      creator: req.user._id,
      videoUrl,
      caption,
      hashtags: tags,
      duration: parseFloat(duration) || 0
    });

    await reel.populate('creator', 'username avatar');
    res.status(201).json(reel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id)
      .populate('creator', 'username avatar isVerified followers')
      .populate({ path: 'comments', populate: { path: 'user', select: 'username avatar' } });
    if (!reel || reel.isRemoved) return res.status(404).json({ message: 'Reel not found' });
    res.json(reel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.likeReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });

    const liked = reel.likes.includes(req.user._id);
    if (liked) {
      reel.likes.pull(req.user._id);
    } else {
      reel.likes.push(req.user._id);
      const io = req.app.get('io');
      await createNotification(io, { recipient: reel.creator, sender: req.user._id, type: 'like', reel: reel._id });
    }

    reel.trendingScore = reel.likes.length * 2 + reel.views * 0.5 + reel.shares * 3;
    await reel.save();
    res.json({ liked: !liked, likesCount: reel.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.viewReel = async (req, res) => {
  try {
    await Reel.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.shareReel = async (req, res) => {
  try {
    const reel = await Reel.findByIdAndUpdate(req.params.id, { $inc: { shares: 1 } }, { new: true });
    if (!reel) return res.status(404).json({ message: 'Reel not found' });
    res.json({ shares: reel.shares });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });
    if (reel.creator.toString() !== req.user._id.toString() && !req.user.isAdmin)
      return res.status(403).json({ message: 'Not authorized' });
    reel.isRemoved = true;
    await reel.save();
    res.json({ message: 'Reel removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });

    const comment = await Comment.create({ reel: reel._id, user: req.user._id, text: req.body.text });
    reel.comments.push(comment._id);
    await reel.save();

    await comment.populate('user', 'username avatar');
    const io = req.app.get('io');
    await createNotification(io, { recipient: reel.creator, sender: req.user._id, type: 'comment', reel: reel._id, comment: comment._id });

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ reel: req.params.id, isRemoved: false, parentComment: null })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reportReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });
    const alreadyReported = reel.reports.some(r => r.user.toString() === req.user._id.toString());
    if (alreadyReported) return res.status(400).json({ message: 'Already reported' });
    reel.reports.push({ user: req.user._id, reason: req.body.reason });
    await reel.save();
    res.json({ message: 'Reported' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.saveReel = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const saved = user.savedReels.includes(req.params.id);
    if (saved) { user.savedReels.pull(req.params.id); } else { user.savedReels.push(req.params.id); }
    await user.save();
    res.json({ saved: !saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
