const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const categoriaController = require('../controllers/categoriaController');

// Todas as rotas de categorias exigem autenticacao (requisito D).
router.use(authMiddleware);

/**
 * @swagger
 * /categorias:
 *   get:
 *     tags:
 *       - Categorias
 *     summary: Listar todas as categorias
 *     description: Retorna todas as categorias cadastradas. **Requer autenticação JWT.**
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorias retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CategoriaResponse'
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
router.get('/', categoriaController.listarCategorias);

/**
 * @swagger
 * /categorias/{id}:
 *   get:
 *     tags:
 *       - Categorias
 *     summary: Obter categoria por ID
 *     description: Retorna os dados de uma categoria específica. **Requer autenticação JWT.**
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da categoria.
 *         example: 1
 *     responses:
 *       200:
 *         description: Categoria encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriaResponse'
 *       401:
 *         description: Não autorizado — token JWT ausente ou inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *       404:
 *         description: Categoria não encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Categoria não encontrada
 *       500:
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroInterno'
 */
router.get('/:id', categoriaController.obterCategoria);

/**
 * @swagger
 * /categorias:
 *   post:
 *     tags:
 *       - Categorias
 *     summary: Criar nova categoria
 *     description: Cria uma nova categoria. **Requer autenticação JWT.**
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoriaInput'
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Categoria criada com sucesso
 *                 categoria:
 *                   $ref: '#/components/schemas/CategoriaResponse'
 *       400:
 *         description: Campo obrigatório ausente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: O campo nome é obrigatório
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
router.post('/', categoriaController.criarCategoria);

/**
 * @swagger
 * /categorias/{id}:
 *   put:
 *     tags:
 *       - Categorias
 *     summary: Atualizar categoria
 *     description: Atualiza os dados de uma categoria existente. **Requer autenticação JWT.**
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da categoria.
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoriaInput'
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Categoria atualizada com sucesso
 *                 categoria:
 *                   $ref: '#/components/schemas/CategoriaResponse'
 *       400:
 *         description: Campo obrigatório ausente.
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
 *         description: Categoria não encontrada.
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
router.put('/:id', categoriaController.atualizarCategoria);

/**
 * @swagger
 * /categorias/{id}:
 *   delete:
 *     tags:
 *       - Categorias
 *     summary: Excluir categoria
 *     description: Remove uma categoria. **Requer autenticação JWT.**
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da categoria.
 *         example: 1
 *     responses:
 *       200:
 *         description: Categoria excluída com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Categoria deletada com sucesso
 *       401:
 *         description: Não autorizado — token JWT ausente ou inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *       404:
 *         description: Categoria não encontrada.
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
router.delete('/:id', categoriaController.deletarCategoria);

module.exports = router;
