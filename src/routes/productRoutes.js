const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/userAuthMiddleware');

const produtoController = require('../controllers/productControllers');
const upload = require('../middlewares/uploadIMG');

/**
 * @swagger
 * /produtos:
 *   get:
 *     tags:
 *       - Produtos
 *     summary: Listar todos os produtos
 *     description: >
 *       Retorna a lista completa de produtos cadastrados, ordenados do mais
 *       recente ao mais antigo. É possível filtrar por **categoria** usando
 *       o parâmetro de consulta `categoria`.
 *     parameters:
 *       - in: query
 *         name: categoria
 *         required: false
 *         schema:
 *           type: string
 *           enum: [Raquetes, Bolinhas, Redes, Acessórios, Outros]
 *         description: Filtra os produtos pela categoria informada.
 *         example: Raquetes
 *     responses:
 *       200:
 *         description: Lista de produtos retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProdutoResponse'
 *       500:
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroInterno'
 */
router.get('/', produtoController.listarProdutos);

/**
 * @swagger
 * /produtos/{id}:
 *   get:
 *     tags:
 *       - Produtos
 *     summary: Obter produto por ID
 *     description: >
 *       Retorna os detalhes completos de um produto específico, incluindo
 *       os dados do usuário que o cadastrou (nome e email), via populate.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto no MongoDB (ObjectId).
 *         example: "6650f3b2c1d3e45678901234"
 *     responses:
 *       200:
 *         description: Produto encontrado e retornado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProdutoResponse'
 *       404:
 *         description: Nenhum produto encontrado com o ID informado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Produto não encontrado
 *       500:
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroInterno'
 */
router.get('/:id', produtoController.obterProduto);

/**
 * @swagger
 * /produtos:
 *   post:
 *     tags:
 *       - Produtos
 *     summary: Criar novo produto
 *     description: >
 *       Cria um novo produto no catálogo. **Requer autenticação JWT.**
 *       Aceita até **5 imagens** enviadas como `multipart/form-data`
 *       no campo `imagens`, que serão armazenadas no Cloudinary.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - preco
 *               - descricao
 *             properties:
 *               nome:
 *                 type: string
 *                 maxLength: 80
 *                 example: Raquete Butterfly Timo Boll
 *               preco:
 *                 type: number
 *                 format: float
 *                 example: 299.90
 *               descricao:
 *                 type: string
 *                 maxLength: 200
 *                 example: Raquete profissional para jogadores avançados.
 *               categoria:
 *                 type: string
 *                 enum: [Raquetes, Bolinhas, Redes, Acessórios, Outros]
 *                 default: Outros
 *                 example: Raquetes
 *               imagens:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Até 5 imagens do produto (JPG, PNG, WEBP).
 *     responses:
 *       201:
 *         description: Produto criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Produto criado com sucesso
 *                 produto:
 *                   $ref: '#/components/schemas/ProdutoResponse'
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
router.post('/', authMiddleware, upload.array('imagens', 5), produtoController.criarProduto);

/**
 * @swagger
 * /produtos/{id}:
 *   put:
 *     tags:
 *       - Produtos
 *     summary: Atualizar produto completo (substituição total)
 *     description: >
 *       Substitui completamente os dados de um produto existente. **Requer autenticação JWT**
 *       e somente o usuário que criou o produto pode alterá-lo.
 *       Aceita até **5 novas imagens** como `multipart/form-data` — as antigas serão substituídas.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto no MongoDB (ObjectId).
 *         example: "6650f3b2c1d3e45678901234"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 maxLength: 80
 *                 example: Raquete Donic Waldner Senso
 *               preco:
 *                 type: number
 *                 format: float
 *                 example: 189.50
 *               descricao:
 *                 type: string
 *                 maxLength: 200
 *                 example: Raquete de alta performance para competições nacionais.
 *               categoria:
 *                 type: string
 *                 enum: [Raquetes, Bolinhas, Redes, Acessórios, Outros]
 *                 example: Raquetes
 *               imagens:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Até 5 novas imagens (substituem as anteriores).
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Produto atualizado com sucesso
 *                 produto:
 *                   $ref: '#/components/schemas/ProdutoResponse'
 *       401:
 *         description: Não autorizado — token JWT ausente ou inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Token não fornecido
 *       403:
 *         description: Proibido — usuário não tem permissão para editar este produto.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Acesso negado
 *       404:
 *         description: Produto não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Produto não encontrado
 *       500:
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroInterno'
 */
router.put('/:id', authMiddleware, upload.array('imagens', 5), produtoController.atualizarProduto);

/**
 * @swagger
 * /produtos/{id}:
 *   patch:
 *     tags:
 *       - Produtos
 *     summary: Atualizar produto parcialmente
 *     description: >
 *       Atualiza apenas os campos enviados no corpo da requisição (JSON).
 *       **Requer autenticação JWT** e somente o criador do produto pode alterá-lo.
 *       Ideal para pequenas correções sem precisar reenviar todos os dados.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto no MongoDB (ObjectId).
 *         example: "6650f3b2c1d3e45678901234"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProdutoPatchInput'
 *           example:
 *             preco: 249.90
 *             categoria: Raquetes
 *     responses:
 *       200:
 *         description: Produto atualizado parcialmente com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Produto atualizado parcialmente com sucesso
 *                 produto:
 *                   $ref: '#/components/schemas/ProdutoResponse'
 *       401:
 *         description: Não autorizado — token JWT ausente ou inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Token não fornecido
 *       403:
 *         description: Proibido — usuário não é o dono do produto.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Acesso negado
 *       404:
 *         description: Produto não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Produto não encontrado
 *       500:
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroInterno'
 */
router.patch('/:id', authMiddleware, produtoController.atualizarParcialProduto);

/**
 * @swagger
 * /produtos/{id}:
 *   delete:
 *     tags:
 *       - Produtos
 *     summary: Excluir produto
 *     description: >
 *       Remove permanentemente um produto do catálogo. **Requer autenticação JWT**
 *       e somente o usuário que criou o produto pode excluí-lo.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto no MongoDB (ObjectId).
 *         example: "6650f3b2c1d3e45678901234"
 *     responses:
 *       200:
 *         description: Produto excluído com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Produto deletado com sucesso
 *       401:
 *         description: Não autorizado — token JWT ausente ou inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Token não fornecido
 *       403:
 *         description: Proibido — usuário não tem permissão para excluir este produto.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Acesso negado
 *       404:
 *         description: Produto não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResponse'
 *             example:
 *               msg: Produto não encontrado
 *       500:
 *         description: Erro interno do servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroInterno'
 */
router.delete('/:id', authMiddleware, produtoController.deletarProduto);

module.exports = router;