const jwt = require('jsonwebtoken');
const config = require('config'); 

module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check, if no token 
  if(!token) {
    return res.status(401).json({ msg: 'Authorisation denied! No user token' });
  }

  // If token available. Verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));

    req.user = decoded.user;
    next();

  } catch(err) {
    res.status(401).json({ msg: 'Invalid user token' });
  }
};