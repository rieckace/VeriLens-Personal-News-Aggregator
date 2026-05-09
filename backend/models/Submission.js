const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000 },
    url: { type: String, trim: true, maxlength: 2048 },
    imageUrl: { type: String, trim: true, maxlength: 2048 },
    category: { type: String, trim: true, maxlength: 50 },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },

    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    reviewNote: { type: String, trim: true, maxlength: 500 },
    approvedAt: { type: Date },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

module.exports = mongoose.model('Submission', submissionSchema);
