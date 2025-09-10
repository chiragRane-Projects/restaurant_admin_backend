const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token provided' });

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function ownerOnly(req, res, next) {
  if (!req.user || req.user.role !== 'owner') return res.status(403).json({ message: 'Forbidden' });
  next();
}

module.exports = { auth, ownerOnly };