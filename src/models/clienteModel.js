const pool = require('../config/database');

// Model da tabela `clientes`. Todas as queries usam prepared statements (?).

exports.listarTodos = async () => {
  const [linhas] = await pool.execute(
    'SELECT id_cliente, nome, telefone, status FROM clientes ORDER BY id_cliente DESC'
  );
  return linhas;
};

exports.buscarPorId = async (id) => {
  const [linhas] = await pool.execute(
    'SELECT id_cliente, nome, telefone, status FROM clientes WHERE id_cliente = ?',
    [id]
  );
  return linhas[0] || null;
};

exports.criar = async ({ nome, telefone, status }) => {
  const [resultado] = await pool.execute(
    'INSERT INTO clientes (nome, telefone, status) VALUES (?, ?, ?)',
    [nome, telefone, status]
  );
  return resultado.insertId;
};

exports.atualizar = async (id, { nome, telefone, status }) => {
  const [resultado] = await pool.execute(
    'UPDATE clientes SET nome = ?, telefone = ?, status = ? WHERE id_cliente = ?',
    [nome, telefone, status, id]
  );
  return resultado.affectedRows;
};

exports.deletar = async (id) => {
  const [resultado] = await pool.execute(
    'DELETE FROM clientes WHERE id_cliente = ?',
    [id]
  );
  return resultado.affectedRows;
};
