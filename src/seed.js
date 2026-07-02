require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./config/database');

// Categorias e produtos de exemplo (o produto referencia a categoria pelo nome,
// que é resolvido para o id durante o seed).
const categorias = ['Raquetes', 'Bolinhas', 'Redes', 'Acessórios'];

const produtos = [
  { nome: 'Olden Racket', valor: 229.99, estoque: 10, categoria: 'Raquetes' },
  { nome: 'Roiesk Balls', valor: 39.99, estoque: 50, categoria: 'Bolinhas' },
];

async function garantirCategoria(nome) {
  const [existentes] = await pool.execute(
    'SELECT id_categoria FROM categorias WHERE nome = ?',
    [nome]
  );
  if (existentes.length > 0) return existentes[0].id_categoria;

  const [resultado] = await pool.execute(
    'INSERT INTO categorias (nome) VALUES (?)',
    [nome]
  );
  console.log(`✅ Categoria criada: ${nome}`);
  return resultado.insertId;
}

async function seed() {
  try {
    await pool.testarConexao();

    // Usuário administrador para autenticação
    const email = 'pittapong@pittapong.com';
    const [usuarios] = await pool.execute(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [email]
    );
    if (usuarios.length === 0) {
      const hash = await bcrypt.hash('PittaPong123!', 10);
      await pool.execute(
        'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
        ['PittaPong', email, hash]
      );
      console.log('✅ Usuário PittaPong criado (login: pittapong@pittapong.com / PittaPong123!)');
    } else {
      console.log('ℹ️  Usuário PittaPong já existente');
    }

    // Categorias
    const idsCategorias = {};
    for (const nome of categorias) {
      idsCategorias[nome] = await garantirCategoria(nome);
    }

    // Produtos
    for (const dados of produtos) {
      const [existe] = await pool.execute(
        'SELECT id_produto FROM produtos WHERE nome = ?',
        [dados.nome]
      );
      if (existe.length === 0) {
        await pool.execute(
          'INSERT INTO produtos (nome, valor, estoque, categorias_id_categoria) VALUES (?, ?, ?, ?)',
          [dados.nome, dados.valor, dados.estoque, idsCategorias[dados.categoria]]
        );
        console.log(`✅ Produto criado: ${dados.nome}`);
      } else {
        console.log(`⚠️  Produto já existe: ${dados.nome}`);
      }
    }
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await pool.end();
    console.log('🔌 Conexão com o MySQL encerrada');
  }
}

seed();
