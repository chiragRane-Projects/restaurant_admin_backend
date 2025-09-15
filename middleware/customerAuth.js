const jwt = require('jsonwebtoken');
const Customer = require('../models/Customers');

async function customerAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token provided' });

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    const customer = await Customer.findById(decoded.id);
    if (!customer) return res.status(401).json({ message: 'Customer not found' });

    req.customer = customer;
    return next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = customerAuth;
