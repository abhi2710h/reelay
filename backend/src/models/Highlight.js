const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, maxlength: 30 },
  cover: { type: String },
  stories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }]
}, { timestamps: true });

module.exports = mongoose.model('Highlight', highlightSchema);
