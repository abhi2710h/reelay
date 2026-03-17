const { Message, Conversation } = require('../models/Message');
const { createNotification } = require('../utils/notifications');

exports.getConversations = async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'username avatar isOnline lastSeen')
    .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'username' } })
    .sort({ updatedAt: -1 });
  res.json(conversations);
};

exports.getOrCreateConversation = async (req, res) => {
  const { userId } = req.params;
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, userId], $size: 2 },
    isGroup: false
  }).populate('participants', 'username avatar isOnline lastSeen');

  if (!conversation) {
    conversation = await Conversation.create({ participants: [req.user._id, userId] });
    await conversation.populate('participants', 'username avatar isOnline lastSeen');
  }

  res.json(conversation);
};

exports.getMessages = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 30;
  const skip = (page - 1) * limit;

  const messages = await Message.find({ conversation: req.params.conversationId, isDeleted: false })
    .populate('sender', 'username avatar')
    .populate('reel', 'videoUrl thumbnailUrl caption creator')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  await Message.updateMany(
    { conversation: req.params.conversationId, sender: { $ne: req.user._id }, readBy: { $ne: req.user._id } },
    { $addToSet: { readBy: req.user._id } }
  );

  res.json(messages.reverse());
};

exports.sendMessage = async (req, res) => {
  const { text, reelId } = req.body;
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !conversation.participants.includes(req.user._id))
    return res.status(403).json({ message: 'Not authorized' });

  const message = await Message.create({
    conversation: conversationId,
    sender: req.user._id,
    text,
    reel: reelId || null,
    readBy: [req.user._id]
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  await message.populate('sender', 'username avatar');
  if (reelId) await message.populate('reel', 'videoUrl thumbnailUrl caption');

  const io = req.app.get('io');
  io.to(`conversation:${conversationId}`).emit('message:new', message);

  const otherParticipants = conversation.participants.filter(p => p.toString() !== req.user._id.toString());
  for (const participantId of otherParticipants) {
    await createNotification(io, { recipient: participantId, sender: req.user._id, type: 'message' });
  }

  res.status(201).json(message);
};

exports.markAsRead = async (req, res) => {
  await Message.updateMany(
    { conversation: req.params.conversationId, readBy: { $ne: req.user._id } },
    { $addToSet: { readBy: req.user._id } }
  );
  const io = req.app.get('io');
  io.to(`conversation:${req.params.conversationId}`).emit('messages:read', { userId: req.user._id });
  res.json({ success: true });
};
