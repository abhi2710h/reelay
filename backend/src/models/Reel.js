const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, default: '' },
  caption: { type: String, maxlength: 2200, default: '' },
  hashtags: [{ type: String, lowercase: true }],
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  duration: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
  isRemoved: { type: Boolean, default: false },
  music: { title: String, artist: String },
  reports: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, reason: String, createdAt: { type: Date, default: Date.now } }],
  trendingScore: { type: Number, default: 0 }
}, { timestamps: true });

reelSchema.index({ creator: 1, createdAt: -1 });
reelSchema.index({ hashtags: 1 });
reelSchema.index({ trendingScore: -1 });

module.exports = mongoose.model('Reel', reelSchema);
