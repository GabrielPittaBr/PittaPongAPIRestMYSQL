const pool = require('../config/database');

// Model da tabela `usuarios`. Todas as queries usam prepared statements (?)
// para impedir SQL Injection.

// Busca um usuario pelo email (usado no login e na checagem de duplicidade).
exports.buscarPorEmail = async (email) => {
  const [linhas] = await pool.execute(
    'SELECT id_usuario, nome, email, senha FROM usuarios WHERE email = ?',
    [email]
  );
  return linhas[0] || null;
};

// Busca um usuario pelo id (usado na validacao do middleware de autenticacao).
exports.buscarPorId = async (id) => {
  const [linhas] = await pool.execute(
    'SELECT id_usuario, nome, email FROM usuarios WHERE id_usuario = ?',
    [id]
  );
  return linhas[0] || null;
};

// Cria um novo usuario e retorna o id gerado.
exports.criar = async ({ nome, email, senha }) => {
  const [resultado] = await pool.execute(
    'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
    [nome, email, senha]
  );
  return resultado.insertId;
};
