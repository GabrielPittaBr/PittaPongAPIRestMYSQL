const mongoose = require('mongoose');

const ProdutoSchema = new mongoose.Schema({
  nome: String,
  preco: Number,
  descricao: String,
  imagens: [String] // URLs ou caminhos
});

module.exports = mongoose.model('Produto', ProdutoSchema);