const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    content: { type: String },
    source: { type: String },
    url: { type: String, required: true, unique: true },
    imageUrl: { type: String },
    category: { type: String, index: true },
    sentimentScore: { type: Number, default: 0 },
    sentimentLabel: { type: String, default: 'neutral' },
    biasScore: { type: Number, default: 0 },
    biasLabel: { type: String, default: 'center' },
    fakeProbability: { type: Number, default: 0 },
    publishedAt: { type: Date },

    // Optional AI enrichment (generated on-demand)
    aiSummary: { type: String },
    aiTakeaways: { type: [String], default: undefined },
    aiTopics: { type: [String], default: undefined },
    aiProvider: { type: String },
    aiModel: { type: String },
    aiGeneratedAt: { type: Date },
    aiError: { type: String },
  },
  { timestamps: true }
);

articleSchema.index({ title: 'text', description: 'text', content: 'text', source: 'text' });

module.exports = mongoose.model('Article', articleSchema);
