const Produto = require('../models/produtoModel');
const Categoria = require('../models/categoriaModel');

// GET /produtos - listar todos (com filtro opcional por categoria: ?categoria=<id>)
exports.listarProdutos = async (req, res) => {
  try {
    const categoriaFiltro = req.query.categoria || null;
    const produtos = await Produto.listarTodos(categoriaFiltro);
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// GET /produtos/:id - obter um produto pelo id
exports.obterProduto = async (req, res) => {
  try {
    const produto = await Produto.buscarPorId(req.params.id);
    if (!produto) {
      return res.status(404).json({ msg: 'Produto não encontrado' });
    }
    res.json(produto);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// POST /produtos - criar produto
exports.criarProduto = async (req, res) => {
  try {
    const { nome, valor, estoque, categorias_id_categoria } = req.body;

    if (!nome || valor === undefined || !categorias_id_categoria) {
      return res.status(400).json({
        msg: 'Preencha os campos obrigatórios (nome, valor, categorias_id_categoria)',
      });
    }

    // Valida a existencia da categoria (FK) antes de inserir.
    const categoria = await Categoria.buscarPorId(categorias_id_categoria);
    if (!categoria) {
      return res.status(400).json({ msg: 'Categoria informada não existe' });
    }

    const estoqueFinal = estoque === undefined ? 1 : estoque;
    const id = await Produto.criar({
      nome,
      valor,
      estoque: estoqueFinal,
      categorias_id_categoria,
    });

    res.status(201).json({
      msg: 'Produto criado com sucesso',
      produto: {
        id_produto: id,
        nome,
        valor,
        estoque: estoqueFinal,
        categorias_id_categoria,
      },
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// PUT /produtos/:id - atualizar produto por completo
exports.atualizarProduto = async (req, res) => {
  try {
    const { nome, valor, estoque, categorias_id_categoria } = req.body;

    if (!nome || valor === undefined || !categorias_id_categoria) {
      return res.status(400).json({
        msg: 'Preencha os campos obrigatórios (nome, valor, categorias_id_categoria)',
      });
    }

    const produto = await Produto.buscarPorId(req.params.id);
    if (!produto) {
      return res.status(404).json({ msg: 'Produto não encontrado' });
    }

    const categoria = await Categoria.buscarPorId(categorias_id_categoria);
    if (!categoria) {
      return res.status(400).json({ msg: 'Categoria informada não existe' });
    }

    const estoqueFinal = estoque === undefined ? produto.estoque : estoque;
    await Produto.atualizar(req.params.id, {
      nome,
      valor,
      estoque: estoqueFinal,
      categorias_id_categoria,
    });

    res.json({
      msg: 'Produto atualizado com sucesso',
      produto: {
        id_produto: Number(req.params.id),
        nome,
        valor,
        estoque: estoqueFinal,
        categorias_id_categoria,
      },
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// DELETE /produtos/:id - deletar produto
exports.deletarProduto = async (req, res) => {
  try {
    const produto = await Produto.buscarPorId(req.params.id);
    if (!produto) {
      return res.status(404).json({ msg: 'Produto não encontrado' });
    }

    await Produto.deletar(req.params.id);

    res.json({ msg: 'Produto deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};
