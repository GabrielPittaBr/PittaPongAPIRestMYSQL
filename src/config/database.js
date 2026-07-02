const mysql = require('mysql2/promise');
require('dotenv').config();

// Pool de conexoes MySQL com suporte a Promises/async-await.
// Todas as queries dos models usam prepared statements (?) atraves deste pool.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Testa a conexao com o banco no boot da aplicacao.
const testarConexao = async () => {
  const conexao = await pool.getConnection();
  await conexao.ping();
  conexao.release();
  console.log('Conectado ao MySQL com sucesso!');
};

module.exports = pool;
module.exports.testarConexao = testarConexao;
