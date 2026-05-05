const model = require("../models/productModels");

exports.getHome = (req, res) => {
    const produtos = model.getProdutos();
    res.render('index', { title: 'PittaPong', produtos });
};

exports.getAcompanhamento = (req, res) => {
    const produtos = model.getProdutos();
    res.render('acompanhamento', { title: 'PittaPong - Acompanhamento', produtos });
};

exports.getCarrinho = (req, res) => {
    const produtos = model.getProdutos();
    res.render('carrinho', { title: 'PittaPong - Carrinho', produtos });
};

exports.getCheckout = (req, res) => {
    const produtos = model.getProdutos();
    res.render('checkout', { title: 'PittaPong - Checkout', produtos });
};

exports.getProduto = (req, res) => {
    const produtos = model.getProdutos();
    res.render('produto', { title: 'Produtos', produtos });
};

exports.addProduto = (req, res) => {
    const { nome, detalhes, preco } = req.body;

    model.addProduto(nome, detalhes, preco);

    res.redirect('/produtos');
};

exports.deleteProduto = (req, res) => {
    const { index } = req.params;

    model.deleteProduto(index);

    res.redirect('/produtos');
};

exports.getProdutoDetalhe = (req, res) => {
    const id = req.params.id;

    const produto = model.getProdutoById(id);

    res.render('produtoDetalhe', { title: `Produto ${produto.nome}`, produto });
};

exports.getEditProduto = (req, res) => {
    const id = req.params.id;
    const produto = model.getProdutoById(id);

    if (!produto) {
        return res.send("Produto não encontrado");
    }

    res.render('editarProduto', { title: 'Editar Produto', produto });
};

exports.postEditProduto = (req, res) => {
    const id = req.params.id;
    const { nome, detalhes, preco } = req.body;

    model.updateProduto(id, nome, detalhes, preco);

    res.redirect('/produtos');
};