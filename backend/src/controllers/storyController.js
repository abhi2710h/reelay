const Story = require('../models/Story');
const User = require('../models/User');

exports.createStory = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Media file required' });
    const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    const mediaUrl = req.file.path;

    const story = await Story.create({
      creator: req.user._id,
      mediaUrl,
      mediaType,
      caption: req.body.caption || ''
    });

    await story.populate('creator', 'username avatar');
    res.status(201).json(story);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFollowingStories = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const stories = await Story.find({
      creator: { $in: [...user.following, req.user._id] },
      expiresAt: { $gt: new Date() },
      isActive: true
    })
      .populate('creator', 'username avatar')
      .sort({ createdAt: -1 });

    const grouped = stories.reduce((acc, story) => {
      const creatorId = story.creator._id.toString();
      if (!acc[creatorId]) acc[creatorId] = { creator: story.creator, stories: [] };
      acc[creatorId].stories.push(story);
      return acc;
    }, {});

    res.json(Object.values(grouped));
  } catch (err) {
    res.json([]);
  }
};

exports.viewStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    const alreadyViewed = story.viewers.some(v => v.user.toString() === req.user._id.toString());
    if (!alreadyViewed) { story.viewers.push({ user: req.user._id }); await story.save(); }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    if (story.creator.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    story.isActive = false;
    await story.save();
    res.json({ message: 'Story deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
