const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const { validateInput } = require('../middleware/validation');

// Development auth routes
router.post('/login', authController.login);
router.post('/register', authController.register);

module.exports = router;
