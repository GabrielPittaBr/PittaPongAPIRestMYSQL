const Produto = require('../models/productModels');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// função pra enviar pro cloudinary
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

// GET /produtos - listar todos
exports.listarProdutos = async (req, res) => {
  try {
    const produtos = await Produto.find().sort({ createdAt: -1 });
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// GET /vender - renderizar formulário
exports.getVender = (req, res) => {
  const sucesso = req.query.sucesso === 'true';
  const erro = req.query.erro || null;
  res.render('venda/vender', { title: 'PittaPong - Vender', sucesso, erro });
};

// POST /produtos - criar produto
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
      imagens: urls,
      usuario: req.userId
    });

    await produto.save();

    // Redireciona de volta ao formulário com mensagem de sucesso
    res.redirect('/vender?sucesso=true');
  } catch (err) {
    res.redirect(`/vender?erro=${encodeURIComponent(err.message)}`);
  }
};

// POST /produtos/:id/editar - editar produto via formulário
exports.editarProdutoForm = async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);

    if (!produto)
      return res.redirect(`/editar-produto/${req.params.id}?erro=${encodeURIComponent('Produto não encontrado')}`);

    if (produto.usuario.toString() !== req.userId)
      return res.redirect(`/editar-produto/${req.params.id}?erro=${encodeURIComponent('Acesso negado')}`);

    // Update fields
    produto.nome = req.body.nome || produto.nome;
    produto.preco = req.body.preco || produto.preco;
    produto.descricao = req.body.descricao || produto.descricao;

    // If new images were uploaded, replace the old ones
    if (req.files && req.files.length > 0) {
      const urls = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        urls.push(result.secure_url);
      }
      produto.imagens = urls;
    }

    await produto.save();

    res.redirect(`/editar-produto/${produto._id}?sucesso=true`);
  } catch (err) {
    res.redirect(`/editar-produto/${req.params.id}?erro=${encodeURIComponent(err.message)}`);
  }
};

exports.atualizarProduto = async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);

    if (!produto)
      return res.status(404).json({ msg: 'Produto não encontrado' });

    if (produto.usuario.toString() !== req.userId)
      return res.status(403).json({ msg: 'Acesso negado' });

    Object.assign(produto, req.body);
    await produto.save();

    res.json(produto);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

exports.deletarProduto = async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);

    if (!produto)
      return res.status(404).json({ msg: 'Produto não encontrado' });

    if (produto.usuario.toString() !== req.userId)
      return res.status(403).json({ msg: 'Acesso negado' });

    await produto.deleteOne();

    res.json({ msg: 'Produto deletado' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};