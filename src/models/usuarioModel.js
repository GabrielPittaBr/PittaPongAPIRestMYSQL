const pool = require('../config/database');

// Model da tabela `usuarios`. Todas as queries usam prepared statements (?)
// para impedir SQL Injection.

// Busca um usuario pelo nick (usado no login e na checagem de duplicidade).
exports.buscarPorNick = async (nick) => {
  const [linhas] = await pool.execute(
    'SELECT id_usuario, nome, nick, senha FROM usuarios WHERE nick = ?',
    [nick]
  );
  return linhas[0] || null;
};

// Busca um usuario pelo id (usado na validacao do middleware de autenticacao).
exports.buscarPorId = async (id) => {
  const [linhas] = await pool.execute(
    'SELECT id_usuario, nome, nick FROM usuarios WHERE id_usuario = ?',
    [id]
  );
  return linhas[0] || null;
};

// Cria um novo usuario e retorna o id gerado.
exports.criar = async ({ nome, nick, senha }) => {
  const [resultado] = await pool.execute(
    'INSERT INTO usuarios (nome, nick, senha) VALUES (?, ?, ?)',
    [nome, nick, senha]
  );
  return resultado.insertId;
};
