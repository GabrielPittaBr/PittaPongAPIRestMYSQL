const express = require('express');
require('dotenv').config();

const pool = require('./config/database');

// Rotas
const apiRoutes = require('./routes/apiRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentação Swagger — acessível em /api-docs
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    customSiteTitle: 'PittaPong API Docs',
    customCss: `
      .swagger-ui .topbar { background-color: #1a1a2e; }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);

// Rotas da API
app.use('/api', apiRoutes); // rota pública de status/versão
app.use('/usuario', usuarioRoutes);
app.use('/categorias', categoriaRoutes);
app.use('/produtos', produtoRoutes);
app.use('/clientes', clienteRoutes);
app.use('/pedidos', pedidoRoutes);

// Rota raiz - informações da API
app.get('/', (req, res) => {
  res.json({
    api: 'PittaPong REST API',
    versao: '2.0.0',
    documentacao: 'http://localhost:3000/api-docs',
    endpoints: {
      status: {
        'GET /api/status': 'Status e versão da API (público)',
        'GET /api/versao': 'Versão da API (público)',
      },
      usuario: {
        'POST /usuario/cadastro': 'Registrar novo usuário',
        'POST /usuario/login': 'Login e obter token JWT',
        'POST /usuario/logout': 'Logout (simbólico)',
      },
      categorias: 'CRUD de categorias (requer autenticação)',
      produtos: 'CRUD de produtos (requer autenticação)',
      clientes: 'CRUD de clientes (requer autenticação)',
      pedidos: 'CRUD de pedidos com itens (requer autenticação)',
    },
  });
});

// Testa a conexão com o MySQL e inicia o servidor
pool.testarConexao()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Documentação Swagger: http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((error) => {
    console.error('Erro ao conectar ao MySQL:', error.message);
    process.exit(1);
  });
