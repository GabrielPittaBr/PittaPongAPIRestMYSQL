const express = require('express');
require('dotenv').config();

const conectarDB = require('./config/db');
const produtoRoutes = require('./routes/productRoutes');
const usuarioRoutes = require('./routes/userRoutes');

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
app.use('/produtos', produtoRoutes);
app.use('/usuario', usuarioRoutes);

// Rota raiz (quando não há rotas correspondentes) - informações da API
app.get('/', (req, res) => {
  res.json({
    api: 'PittaPong REST API',
    versao: '1.1.0',
    documentacao: 'http://localhost:3000/api-docs',
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
    console.log(`Documentação Swagger: http://localhost:${PORT}/api-docs`);
  });
});