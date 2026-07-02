const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const clienteController = require('../controllers/clienteController');

// Todas as rotas de clientes exigem autenticacao (requisito D).
router.use(authMiddleware);

/**
 * @swagger
 * /clientes:
 *   get:
 *     tags:
 *       - Clientes
 *     summary: Listar todos os clientes
 *     description: Retorna todos os clientes cadastrados. **Requer autenticação JWT.**
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClienteResponse'
 *       401:
 *         description: Não autorizado — token JWT ausente ou inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Token não fornecido
 *       500:
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroInterno'
 */
router.get('/', clienteController.listarClientes);

/**
 * @swagger
 * /clientes/{id}:
 *   get:
 *     tags:
 *       - Clientes
 *     summary: Obter cliente por ID
 *     description: Retorna os dados de um cliente específico. **Requer autenticação JWT.**
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do cliente.
 *         example: 1
 *     responses:
 *       200:
 *         description: Cliente encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClienteResponse'
 *       401:
 *         description: Não autorizado — token JWT ausente ou inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *       404:
 *         description: Cliente não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Cliente não encontrado
 *       500:
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroInterno'
 */
router.get('/:id', clienteController.obterCliente);

/**
 * @swagger
 * /clientes:
 *   post:
 *     tags:
 *       - Clientes
 *     summary: Criar novo cliente
 *     description: Cria um novo cliente. **Requer autenticação JWT.**
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClienteInput'
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Cliente criado com sucesso
 *                 cliente:
 *                   $ref: '#/components/schemas/ClienteResponse'
 *       400:
 *         description: Campos obrigatórios ausentes ou status inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Preencha os campos obrigatórios (nome, telefone)
 *       401:
 *         description: Não autorizado — token JWT ausente ou inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *       500:
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroInterno'
 */
router.post('/', clienteController.criarCliente);

/**
 * @swagger
 * /clientes/{id}:
 *   put:
 *     tags:
 *       - Clientes
 *     summary: Atualizar cliente
 *     description: Atualiza os dados de um cliente existente. **Requer autenticação JWT.**
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do cliente.
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClienteInput'
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Cliente atualizado com sucesso
 *                 cliente:
 *                   $ref: '#/components/schemas/ClienteResponse'
 *       400:
 *         description: Campos obrigatórios ausentes ou status inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *       401:
 *         description: Não autorizado — token JWT ausente ou inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *       404:
 *         description: Cliente não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *       500:
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroInterno'
 */
router.put('/:id', clienteController.atualizarCliente);

/**
 * @swagger
 * /clientes/{id}:
 *   delete:
 *     tags:
 *       - Clientes
 *     summary: Excluir cliente
 *     description: Remove um cliente. **Requer autenticação JWT.**
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do cliente.
 *         example: 1
 *     responses:
 *       200:
 *         description: Cliente excluído com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Cliente deletado com sucesso
 *       401:
 *         description: Não autorizado — token JWT ausente ou inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *       404:
 *         description: Cliente não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *       500:
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroInterno'
 */
router.delete('/:id', clienteController.deletarCliente);

module.exports = router;
