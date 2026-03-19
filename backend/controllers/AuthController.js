// Simple authentication endpoint for development
const { generateToken } = require('../middleware/auth');

const login = async (req, res) => {
  try {
    // For development, create a simple user
    const user = {
      id: 'dev-user',
      username: 'developer',
      role: 'admin'
    };

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

const register = async (req, res) => {
  try {
    // For development, create a simple user
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = {
      id: 'dev-user',
      username: username,
      role: 'admin'
    };

    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

module.exports = {
  login,
  register
};
