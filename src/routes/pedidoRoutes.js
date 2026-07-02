const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const pedidoController = require('../controllers/pedidoController');

// Todas as rotas de pedidos exigem autenticacao (requisito D).
router.use(authMiddleware);

/**
 * @swagger
 * /pedidos:
 *   get:
 *     tags:
 *       - Pedidos
 *     summary: Listar todos os pedidos
 *     description: Retorna todos os pedidos com o nome do cliente. **Requer autenticação JWT.**
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PedidoResponse'
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
router.get('/', pedidoController.listarPedidos);

/**
 * @swagger
 * /pedidos/{id}:
 *   get:
 *     tags:
 *       - Pedidos
 *     summary: Obter pedido por ID (com itens)
 *     description: Retorna um pedido específico incluindo seus itens. **Requer autenticação JWT.**
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido.
 *         example: 1
 *     responses:
 *       200:
 *         description: Pedido encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoResponse'
 *       401:
 *         description: Não autorizado — token JWT ausente ou inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *       404:
 *         description: Pedido não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Pedido não encontrado
 *       500:
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroInterno'
 */
router.get('/:id', pedidoController.obterPedido);

/**
 * @swagger
 * /pedidos:
 *   post:
 *     tags:
 *       - Pedidos
 *     summary: Criar novo pedido com itens
 *     description: >
 *       Cria um pedido para um cliente existente e insere seus itens
 *       (tabela produtos_pedidos) dentro de uma transação. **Requer autenticação JWT.**
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PedidoInput'
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Pedido criado com sucesso
 *                 pedido:
 *                   $ref: '#/components/schemas/PedidoResponse'
 *       400:
 *         description: Campos obrigatórios ausentes, cliente/produto inexistente ou itens inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Informe ao menos um item em "itens"
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
router.post('/', pedidoController.criarPedido);

/**
 * @swagger
 * /pedidos/{id}:
 *   put:
 *     tags:
 *       - Pedidos
 *     summary: Atualizar pedido
 *     description: >
 *       Atualiza o cabeçalho do pedido (data e cliente). Se o campo `itens`
 *       for enviado, todos os itens são substituídos (transação). **Requer autenticação JWT.**
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido.
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PedidoInput'
 *     responses:
 *       200:
 *         description: Pedido atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Pedido atualizado com sucesso
 *                 pedido:
 *                   $ref: '#/components/schemas/PedidoResponse'
 *       400:
 *         description: Campos obrigatórios ausentes, cliente/produto inexistente ou itens inválidos.
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
 *         description: Pedido não encontrado.
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
router.put('/:id', pedidoController.atualizarPedido);

/**
 * @swagger
 * /pedidos/{id}:
 *   delete:
 *     tags:
 *       - Pedidos
 *     summary: Excluir pedido
 *     description: Remove um pedido e seus itens (transação). **Requer autenticação JWT.**
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido.
 *         example: 1
 *     responses:
 *       200:
 *         description: Pedido excluído com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Pedido deletado com sucesso
 *       401:
 *         description: Não autorizado — token JWT ausente ou inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *       404:
 *         description: Pedido não encontrado.
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
router.delete('/:id', pedidoController.deletarPedido);

module.exports = router;
