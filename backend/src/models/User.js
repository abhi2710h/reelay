const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  fullName: { type: String, trim: true, maxlength: 60 },
  bio: { type: String, maxlength: 150, default: '' },
  avatar: { type: String, default: '' },
  website: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  emailVerifyToken: { type: String },
  emailVerifyExpires: { type: Date },
  isAdmin: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  isDeactivated: { type: Boolean, default: false },
  isPrivate: { type: Boolean, default: false },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  savedReels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reel' }],
  passwordResetToken: String,
  passwordResetExpires: Date,
  refreshTokens: [String],
  lastSeen: { type: Date, default: Date.now },
  isOnline: { type: Boolean, default: false },
  settings: {
    showOnlineStatus: { type: Boolean, default: true },
    allowMessages: { type: String, enum: ['everyone', 'followers', 'none'], default: 'everyone' },
    showActivity: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true }
  }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
