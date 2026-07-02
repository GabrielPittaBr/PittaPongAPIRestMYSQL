require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./config/database');

// O banco ja e populado com dados reais pelo script database/pittapong.sql.
// Este seed apenas garante um usuario administrador com senha bcrypt para o login
// (o usuario `candido` do dump usa MD5 e nao e compativel com bcrypt).
const ADMIN = { nome: 'PittaPong Admin', nick: 'pittapong', senha: 'PittaPong123!' };

async function seed() {
  try {
    await pool.testarConexao();

    const [usuarios] = await pool.execute(
      'SELECT id_usuario FROM usuarios WHERE nick = ?',
      [ADMIN.nick]
    );

    if (usuarios.length === 0) {
      const hash = await bcrypt.hash(ADMIN.senha, 10);
      await pool.execute(
        'INSERT INTO usuarios (nome, nick, senha) VALUES (?, ?, ?)',
        [ADMIN.nome, ADMIN.nick, hash]
      );
      console.log(`✅ Usuário admin criado (nick: ${ADMIN.nick} / senha: ${ADMIN.senha})`);
    } else {
      console.log(`ℹ️  Usuário admin (nick: ${ADMIN.nick}) já existente`);
    }
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await pool.end();
    console.log('🔌 Conexão com o MySQL encerrada');
  }
}

seed();
