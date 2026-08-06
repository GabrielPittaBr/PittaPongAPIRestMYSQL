const mysql = require('mysql2/promise');
require('dotenv').config();

// Monta a opcao de TLS do pool a partir do ambiente.
// Local (sem DB_SSL): retorna undefined e a conexao segue sem TLS, como antes.
// Nuvem (DB_SSL ativo): exige o certificado CA do provedor em DB_SSL_CA e valida
// o certificado apresentado pelo servidor.
const montarSSL = () => {
  const habilitado = String(process.env.DB_SSL).toLowerCase() === 'true';
  if (!habilitado) return undefined;

  const ca = process.env.DB_SSL_CA;
  if (!ca) {
    throw new Error(
      'DB_SSL esta ativo mas DB_SSL_CA nao foi definido. ' +
        'Informe o conteudo do certificado CA do provedor (ca.pem).'
    );
  }

  return { ca, rejectUnauthorized: true };
};

// Pool de conexoes MySQL com suporte a Promises/async-await.
// Todas as queries dos models usam prepared statements (?) atraves deste pool.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: montarSSL(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Testa a conexao com o banco no boot da aplicacao.
const testarConexao = async () => {
  const conexao = await pool.getConnection();
  await conexao.ping();
  conexao.release();
  const modo = process.env.DB_SSL === 'true' ? 'com SSL' : 'sem SSL';
  console.log(`Conectado ao MySQL com sucesso (${modo})!`);
};

module.exports = pool;
module.exports.testarConexao = testarConexao;
