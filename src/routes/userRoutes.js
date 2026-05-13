const express = require('express');
const router = express.Router();

const authController = require('../controllers/userControllers');

router.post('/cadastro', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

module.exports = router;