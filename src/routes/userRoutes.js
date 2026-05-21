const express = require('express');
const router = express.Router();

const authController = require('../controllers/userControllers');

// POST /usuario/cadastro - registrar novo usuário
router.post('/cadastro', authController.register);

// POST /usuario/login - autenticar e receber token
router.post('/login', authController.login);

// POST /usuario/logout - logout (simbólico)
router.post('/logout', authController.logout);

module.exports = router;