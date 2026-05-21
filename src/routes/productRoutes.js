const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/userAuthMiddleware');

const produtoController = require('../controllers/productControllers');
const upload = require('../middlewares/uploadIMG');

// GET /produtos - listar todos (JSON)
router.get('/', produtoController.listarProdutos);

// GET /produtos/:id - obter um produto pelo ID
router.get('/:id', produtoController.obterProduto);

// POST /produtos - criar produto (até 5 imagens)
router.post('/', authMiddleware, upload.array('imagens', 5), produtoController.criarProduto);

// PUT /produtos/:id - atualizar produto por completo (até 5 imagens)
router.put('/:id', authMiddleware, upload.array('imagens', 5), produtoController.atualizarProduto);

// PATCH /produtos/:id - atualizar parcialmente um produto (JSON body)
router.patch('/:id', authMiddleware, produtoController.atualizarParcialProduto);

// DELETE /produtos/:id - deletar produto
router.delete('/:id', authMiddleware, produtoController.deletarProduto);

module.exports = router;