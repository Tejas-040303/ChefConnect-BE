const jwt = require('jsonwebtoken');
const User = require('../models/Comman/UserSchema');

// Validate required fields for signup
const validateSignUp = (req, res, next) => {
  const { name, email, password, role, location } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Name, email, password, and role are required' });
  }
  if (role === 'Chef' && !location) {
    return res.status(400).json({ message: 'Location is required for Chef' });
  }
  next();
};

// Validate required fields for login
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  next();
};

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded._id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is missing'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Fix: Use the correct field name from jwt payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fix: Use decoded.id or decoded._id depending on how you create tokens
    const userId = decoded.id || decoded._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive or suspended'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        error: error.message
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token',
      error: error.message
    });
  }
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
      if (!req.user) {
          return res.status(401).json({
              success: false,
              message: 'User not authenticated'
          });
      }
      
      // Convert roles to array if it's a single string
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      if (!allowedRoles.includes(req.user.role)) {
          return res.status(403).json({
              success: false,
              message: 'You do not have permission to access this resource'
          });
      }
      
      next();
  };
};

module.exports = { validateSignUp, validateLogin, protect, authenticateUser, authorizeRole};