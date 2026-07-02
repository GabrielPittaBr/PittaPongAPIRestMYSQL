const Categoria = require('../models/categoriaModel');

// GET /categorias - listar todas as categorias
exports.listarCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.listarTodas();
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// GET /categorias/:id - obter uma categoria pelo id
exports.obterCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.buscarPorId(req.params.id);
    if (!categoria) {
      return res.status(404).json({ msg: 'Categoria não encontrada' });
    }
    res.json(categoria);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// POST /categorias - criar categoria
exports.criarCategoria = async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome) {
      return res.status(400).json({ msg: 'O campo nome é obrigatório' });
    }

    const id = await Categoria.criar({ nome });

    res.status(201).json({
      msg: 'Categoria criada com sucesso',
      categoria: { id_categoria: id, nome },
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// PUT /categorias/:id - atualizar categoria
exports.atualizarCategoria = async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome) {
      return res.status(400).json({ msg: 'O campo nome é obrigatório' });
    }

    const categoria = await Categoria.buscarPorId(req.params.id);
    if (!categoria) {
      return res.status(404).json({ msg: 'Categoria não encontrada' });
    }

    await Categoria.atualizar(req.params.id, { nome });

    res.json({
      msg: 'Categoria atualizada com sucesso',
      categoria: { id_categoria: Number(req.params.id), nome },
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// DELETE /categorias/:id - deletar categoria
exports.deletarCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.buscarPorId(req.params.id);
    if (!categoria) {
      return res.status(404).json({ msg: 'Categoria não encontrada' });
    }

    await Categoria.deletar(req.params.id);

    res.json({ msg: 'Categoria deletada com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};
