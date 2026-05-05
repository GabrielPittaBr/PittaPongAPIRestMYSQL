const express = require('express');
const router = express.Router();
const controller = require('../controllers/pagesControllers');

// Mapeamento dos verbos HTTP para as funções do controller
router.get('/', controller.getProdutos);      // GET /produtos
router.post('/', controller.createProduto);   // POST /produtos
router.delete('/:id', controller.deleteProduto); // DELETE /produtos/1

module.exports = router;