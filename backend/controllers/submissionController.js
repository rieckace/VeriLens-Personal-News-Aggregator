const mongoose = require('mongoose');
const Submission = require('../models/Submission');

function isValidHttpUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(String(value));
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

async function createSubmission(req, res, next) {
  try {
    const { title, description, url, imageUrl, category } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'title is required' });
    }

    if (!isValidHttpUrl(url)) {
      return res.status(400).json({ message: 'url must be a valid http(s) URL' });
    }

    if (!isValidHttpUrl(imageUrl)) {
      return res.status(400).json({ message: 'imageUrl must be a valid http(s) URL' });
    }

    const created = await Submission.create({
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
      url: url ? String(url).trim() : '',
      imageUrl: imageUrl ? String(imageUrl).trim() : '',
      category: category ? String(category).trim() : '',
      status: 'pending',
      submittedBy: req.user._id,
    });

    return res.status(201).json({ submission: created });
  } catch (err) {
    return next(err);
  }
}

async function listApprovedSubmissions(req, res, next) {
  try {
    const items = await Submission.find({ status: 'approved' })
      .sort({ approvedAt: -1, reviewedAt: -1, createdAt: -1 })
      .populate('submittedBy', 'name email')
      .lean();

    return res.json({ submissions: items });
  } catch (err) {
    return next(err);
  }
}

async function listSubmissionsForAdmin(req, res, next) {
  try {
    const status = String(req.query.status || 'pending');
    const allowed = new Set(['pending', 'approved', 'rejected']);
    const filterStatus = allowed.has(status) ? status : 'pending';

    const items = await Submission.find({ status: filterStatus })
      .sort({ createdAt: -1 })
      .populate('submittedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .lean();

    return res.json({ submissions: items });
  } catch (err) {
    return next(err);
  }
}

async function approveSubmission(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid submission id' });
    }

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.status = 'approved';
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();
    submission.approvedAt = new Date();
    submission.reviewNote = '';

    await submission.save();

    return res.json({ submission });
  } catch (err) {
    return next(err);
  }
}

async function rejectSubmission(req, res, next) {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid submission id' });
    }

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.status = 'rejected';
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();
    submission.approvedAt = undefined;
    submission.reviewNote = note ? String(note).trim().slice(0, 500) : '';

    await submission.save();

    return res.json({ submission });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createSubmission,
  listApprovedSubmissions,
  listSubmissionsForAdmin,
  approveSubmission,
  rejectSubmission,
};
