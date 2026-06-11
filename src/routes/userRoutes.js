const express = require('express');
const router = express.Router();

const authController = require('../controllers/userControllers');

/**
 * @swagger
 * /usuario/cadastro:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Registrar novo usuário
 *     description: >
 *       Cria uma nova conta de usuário. Após o cadastro bem-sucedido,
 *       um token JWT é retornado automaticamente para que o usuário
 *       já possa usar as rotas protegidas sem precisar fazer login.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CadastroInput'
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso. Retorna dados do usuário e token JWT.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               msg: Usuário cadastrado com sucesso
 *               usuario:
 *                 id: "6650f2a1b4e2c12345678901"
 *                 nome: Gabriel Pitta
 *                 email: gabriel@example.com
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Campos obrigatórios não preenchidos (nome, email ou senha ausentes).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Preencha todos os campos (nome, email, senha)
 *       409:
 *         description: Conflito — email já está cadastrado no sistema.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Email já cadastrado
 *       500:
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroInterno'
 */
router.post('/cadastro', authController.register);

/**
 * @swagger
 * /usuario/login:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Autenticar usuário e obter token JWT
 *     description: >
 *       Valida as credenciais do usuário (email e senha) e retorna um
 *       **token JWT** válido por 1 dia. Copie o token e use o botão
 *       **Authorize** para autenticar as rotas protegidas.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso. Retorna dados do usuário e token JWT.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               msg: Login realizado com sucesso
 *               usuario:
 *                 id: "6650f2a1b4e2c12345678901"
 *                 nome: Gabriel Pitta
 *                 email: gabriel@example.com
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Email ou senha não informados.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Preencha todos os campos (email, senha)
 *       401:
 *         description: Senha inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Senha inválida
 *       404:
 *         description: Usuário não encontrado com o email informado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroInterno'
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /usuario/logout:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Logout (simbólico)
 *     description: >
 *       Realiza o logout simbólico do usuário. Como a API é **stateless** e utiliza
 *       JWT, o token não é invalidado no servidor. O cliente é responsável por
 *       descartar o token localmente após esta chamada.
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Logout realizado com sucesso
 */
router.post('/logout', authController.logout);

module.exports = router;