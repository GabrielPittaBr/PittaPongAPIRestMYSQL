const pool = require('../config/database');

// Model da tabela `produtos`. Todas as queries usam prepared statements (?).

// Lista os produtos com o nome da categoria (JOIN). Filtro opcional por categoria.
exports.listarTodos = async (categoriaId) => {
  let sql =
    'SELECT p.id_produto, p.nome, p.valor, p.estoque, ' +
    'p.categorias_id_categoria, c.nome AS categoria_nome ' +
    'FROM produtos p ' +
    'JOIN categorias c ON p.categorias_id_categoria = c.id_categoria';
  const params = [];

  if (categoriaId) {
    sql += ' WHERE p.categorias_id_categoria = ?';
    params.push(categoriaId);
  }

  sql += ' ORDER BY p.id_produto DESC';

  const [linhas] = await pool.execute(sql, params);
  return linhas;
};

exports.buscarPorId = async (id) => {
  const [linhas] = await pool.execute(
    'SELECT p.id_produto, p.nome, p.valor, p.estoque, ' +
      'p.categorias_id_categoria, c.nome AS categoria_nome ' +
      'FROM produtos p ' +
      'JOIN categorias c ON p.categorias_id_categoria = c.id_categoria ' +
      'WHERE p.id_produto = ?',
    [id]
  );
  return linhas[0] || null;
};

exports.criar = async ({ nome, valor, estoque, categorias_id_categoria }) => {
  const [resultado] = await pool.execute(
    'INSERT INTO produtos (nome, valor, estoque, categorias_id_categoria) VALUES (?, ?, ?, ?)',
    [nome, valor, estoque, categorias_id_categoria]
  );
  return resultado.insertId;
};

exports.atualizar = async (id, { nome, valor, estoque, categorias_id_categoria }) => {
  const [resultado] = await pool.execute(
    'UPDATE produtos SET nome = ?, valor = ?, estoque = ?, categorias_id_categoria = ? WHERE id_produto = ?',
    [nome, valor, estoque, categorias_id_categoria, id]
  );
  return resultado.affectedRows;
};

exports.deletar = async (id) => {
  const [resultado] = await pool.execute(
    'DELETE FROM produtos WHERE id_produto = ?',
    [id]
  );
  return resultado.affectedRows;
};
