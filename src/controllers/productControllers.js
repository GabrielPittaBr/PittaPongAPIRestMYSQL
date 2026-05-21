const Produto = require('../models/productModels');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Função para enviar imagem ao Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'produtos' },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// GET /produtos - listar todos (com filtro opcional por categoria)
exports.listarProdutos = async (req, res) => {
  try {
    const categoriaFiltro = req.query.categoria || null;
    const query = categoriaFiltro ? { categoria: categoriaFiltro } : {};
    const produtos = await Produto.find(query).sort({ createdAt: -1 });
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// GET /produtos/:id - obter um produto pelo ID
exports.obterProduto = async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id).populate('usuario', 'nome email');

    if (!produto) {
      return res.status(404).json({ msg: 'Produto não encontrado' });
    }

    res.json(produto);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// POST /produtos - criar produto (requer autenticação)
exports.criarProduto = async (req, res) => {
  try {
    const urls = [];

    // Se tiver arquivos, envia pro Cloudinary
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        urls.push(result.secure_url);
      }
    }

    const produto = new Produto({
      nome: req.body.nome,
      preco: req.body.preco,
      descricao: req.body.descricao,
      categoria: req.body.categoria || 'Outros',
      imagens: urls,
      usuario: req.userId
    });

    await produto.save();

    res.status(201).json({
      msg: 'Produto criado com sucesso',
      produto
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// PUT /produtos/:id - atualizar produto por completo (requer autenticação)
exports.atualizarProduto = async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);

    if (!produto)
      return res.status(404).json({ msg: 'Produto não encontrado' });

    if (produto.usuario.toString() !== req.userId)
      return res.status(403).json({ msg: 'Acesso negado' });

    // Atualizar campos
    produto.nome = req.body.nome || produto.nome;
    produto.preco = req.body.preco || produto.preco;
    produto.descricao = req.body.descricao || produto.descricao;
    produto.categoria = req.body.categoria || produto.categoria;

    // Se novas imagens foram enviadas, substituir as antigas
    if (req.files && req.files.length > 0) {
      const urls = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        urls.push(result.secure_url);
      }
      produto.imagens = urls;
    }

    await produto.save();

    res.json({
      msg: 'Produto atualizado com sucesso',
      produto
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// PATCH /produtos/:id - atualizar parcialmente um produto (requer autenticação)
exports.atualizarParcialProduto = async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);

    if (!produto)
      return res.status(404).json({ msg: 'Produto não encontrado' });

    if (produto.usuario.toString() !== req.userId)
      return res.status(403).json({ msg: 'Acesso negado' });

    // Atualizar somente os campos enviados no body
    const camposPermitidos = ['nome', 'preco', 'descricao', 'categoria', 'imagens'];
    camposPermitidos.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        produto[campo] = req.body[campo];
      }
    });

    await produto.save();

    res.json({
      msg: 'Produto atualizado parcialmente com sucesso',
      produto
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// DELETE /produtos/:id - deletar produto (requer autenticação)
exports.deletarProduto = async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);

    if (!produto)
      return res.status(404).json({ msg: 'Produto não encontrado' });

    if (produto.usuario.toString() !== req.userId)
      return res.status(403).json({ msg: 'Acesso negado' });

    await produto.deleteOne();

    res.json({ msg: 'Produto deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};