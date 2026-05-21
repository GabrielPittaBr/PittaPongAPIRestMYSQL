const express = require('express');
require('dotenv').config();

const conectarDB = require('./config/db');
const produtoRoutes = require('./routes/productRoutes');
const usuarioRoutes = require('./routes/userRoutes');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use('/produtos', produtoRoutes);
app.use('/usuario', usuarioRoutes);

// Rota raiz (quando não há rotas correspondentes) - informações da API
app.get('/', (req, res) => {
  res.json({
    api: 'PittaPong REST API',
    versao: '2.0',
    endpoints: {
      usuario: {
        'POST /usuario/cadastro': 'Registrar novo usuário',
        'POST /usuario/login': 'Login e obter token JWT',
        'POST /usuario/logout': 'Logout (simbólico)'
      },
      produtos: {
        'GET /produtos': 'Listar todos os produtos (filtro opcional: ?categoria=)',
        'GET /produtos/:id': 'Obter produto por ID',
        'POST /produtos': 'Criar produto (requer autenticação)',
        'PUT /produtos/:id': 'Atualizar produto completo (requer autenticação)',
        'PATCH /produtos/:id': 'Atualizar produto parcial (requer autenticação)',
        'DELETE /produtos/:id': 'Deletar produto (requer autenticação)'
      }
    }
  });
});

// Conectar ao MongoDB e iniciar servidor
conectarDB().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
});