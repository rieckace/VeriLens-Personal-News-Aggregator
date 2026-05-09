const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
    preferences: { type: [String], default: [] },
    readingHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

module.exports = mongoose.model('User', userSchema);
