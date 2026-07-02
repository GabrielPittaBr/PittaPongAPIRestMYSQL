const pool = require('../config/database');

// Model da tabela `categorias`. Todas as queries usam prepared statements (?).

exports.listarTodas = async () => {
  const [linhas] = await pool.execute(
    'SELECT id_categoria, nome FROM categorias ORDER BY id_categoria DESC'
  );
  return linhas;
};

exports.buscarPorId = async (id) => {
  const [linhas] = await pool.execute(
    'SELECT id_categoria, nome FROM categorias WHERE id_categoria = ?',
    [id]
  );
  return linhas[0] || null;
};

exports.criar = async ({ nome }) => {
  const [resultado] = await pool.execute(
    'INSERT INTO categorias (nome) VALUES (?)',
    [nome]
  );
  return resultado.insertId;
};

exports.atualizar = async (id, { nome }) => {
  const [resultado] = await pool.execute(
    'UPDATE categorias SET nome = ? WHERE id_categoria = ?',
    [nome, id]
  );
  return resultado.affectedRows;
};

exports.deletar = async (id) => {
  const [resultado] = await pool.execute(
    'DELETE FROM categorias WHERE id_categoria = ?',
    [id]
  );
  return resultado.affectedRows;
};
