const Highlight = require('../models/Highlight');
const Story = require('../models/Story');

exports.getHighlights = async (req, res) => {
  try {
    const highlights = await Highlight.find({ creator: req.params.userId })
      .populate('stories')
      .sort({ createdAt: -1 });
    res.json(highlights);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createHighlight = async (req, res) => {
  try {
    const { name, storyId } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    const story = storyId ? await Story.findById(storyId) : null;
    const highlight = await Highlight.create({
      creator: req.user._id,
      name,
      cover: story?.mediaUrl || null,
      stories: storyId ? [storyId] : []
    });
    await highlight.populate('stories');
    res.status(201).json(highlight);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addStoryToHighlight = async (req, res) => {
  try {
    const { storyId } = req.body;
    const highlight = await Highlight.findById(req.params.id);
    if (!highlight) return res.status(404).json({ message: 'Highlight not found' });
    if (highlight.creator.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    if (!highlight.stories.includes(storyId)) {
      highlight.stories.push(storyId);
      const story = await Story.findById(storyId);
      if (!highlight.cover && story) highlight.cover = story.mediaUrl;
      await highlight.save();
    }
    await highlight.populate('stories');
    res.json(highlight);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteHighlight = async (req, res) => {
  try {
    const highlight = await Highlight.findById(req.params.id);
    if (!highlight) return res.status(404).json({ message: 'Not found' });
    if (highlight.creator.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await highlight.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeStoryFromHighlight = async (req, res) => {
  try {
    const highlight = await Highlight.findById(req.params.id);
    if (!highlight) return res.status(404).json({ message: 'Not found' });
    if (highlight.creator.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    highlight.stories = highlight.stories.filter(s => s.toString() !== req.params.storyId);
    if (highlight.stories.length > 0) {
      const first = await Story.findById(highlight.stories[0]);
      highlight.cover = first?.mediaUrl || null;
    }
    await highlight.save();
    res.json({ message: 'Removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
