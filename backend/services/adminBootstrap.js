const User = require('../models/User');

function parseAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

async function bootstrapAdminUsers() {
  const emails = parseAdminEmails();
  if (!emails.length) return { promoted: 0 };

  const result = await User.updateMany(
    { email: { $in: emails } },
    { $set: { role: 'admin' } }
  );

  const promoted = result?.modifiedCount ?? result?.nModified ?? 0;
  return { promoted };
}

module.exports = { bootstrapAdminUsers };
