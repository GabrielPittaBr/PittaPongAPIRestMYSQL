const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PittaPong REST API',
      version: '2.0.0',
      description:
        'API REST de e-commerce de artigos esportivos de tênis de mesa. ' +
        'Persistência em **MySQL** (base pittapong). Gerencia categorias, produtos, ' +
        'clientes e pedidos, com autenticação via JWT. ' +
        'Para acessar as rotas protegidas, realize o login e utilize o token no botão **Authorize** acima.',
      contact: {
        name: 'Gabriel Pitta',
        url: 'https://github.com/GabrielPittaBr',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local de desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'Insira o token JWT obtido no endpoint de login. Formato: Bearer <token>',
        },
      },
      schemas: {
        // Status
        StatusResponse: {
          type: 'object',
          properties: {
            versao: { type: 'string', example: '2.0.0' },
            status: { type: 'string', example: 'online' },
          },
        },

        // Usuário / Autenticação
        CadastroInput: {
          type: 'object',
          required: ['nome', 'email', 'senha'],
          properties: {
            nome: { type: 'string', example: 'Gabriel Pitta' },
            email: { type: 'string', format: 'email', example: 'gabriel@example.com' },
            senha: {
              type: 'string',
              format: 'password',
              minLength: 6,
              example: 'minhasenha123',
            },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'senha'],
          properties: {
            email: { type: 'string', format: 'email', example: 'gabriel@example.com' },
            senha: { type: 'string', format: 'password', example: 'minhasenha123' },
          },
        },
        UsuarioResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nome: { type: 'string', example: 'Gabriel Pitta' },
            email: { type: 'string', example: 'gabriel@example.com' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            msg: { type: 'string', example: 'Login realizado com sucesso' },
            usuario: { $ref: '#/components/schemas/UsuarioResponse' },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },

        // Categoria
        CategoriaInput: {
          type: 'object',
          required: ['nome'],
          properties: {
            nome: { type: 'string', maxLength: 45, example: 'Raquetes' },
          },
        },
        CategoriaResponse: {
          type: 'object',
          properties: {
            id_categoria: { type: 'integer', example: 1 },
            nome: { type: 'string', example: 'Raquetes' },
          },
        },

        // Produto
        ProdutoInput: {
          type: 'object',
          required: ['nome', 'valor', 'categorias_id_categoria'],
          properties: {
            nome: { type: 'string', maxLength: 120, example: 'Raquete Butterfly Timo Boll' },
            valor: { type: 'number', format: 'double', example: 299.9 },
            estoque: { type: 'integer', default: 1, example: 15 },
            categorias_id_categoria: { type: 'integer', example: 1 },
          },
        },
        ProdutoResponse: {
          type: 'object',
          properties: {
            id_produto: { type: 'integer', example: 1 },
            nome: { type: 'string', example: 'Raquete Butterfly Timo Boll' },
            valor: { type: 'number', example: 299.9 },
            estoque: { type: 'integer', example: 15 },
            categorias_id_categoria: { type: 'integer', example: 1 },
            categoria_nome: { type: 'string', example: 'Raquetes' },
          },
        },

        // Cliente
        ClienteInput: {
          type: 'object',
          required: ['nome', 'telefone'],
          properties: {
            nome: { type: 'string', maxLength: 45, example: 'João Silva' },
            telefone: { type: 'string', maxLength: 15, example: '11999998888' },
            status: {
              type: 'string',
              enum: ['bom', 'medio', 'ruim'],
              default: 'medio',
              example: 'bom',
            },
          },
        },
        ClienteResponse: {
          type: 'object',
          properties: {
            id_cliente: { type: 'integer', example: 1 },
            nome: { type: 'string', example: 'João Silva' },
            telefone: { type: 'string', example: '11999998888' },
            status: { type: 'string', example: 'bom' },
          },
        },

        // Pedido / Itens
        ItemPedidoInput: {
          type: 'object',
          required: ['produtos_id_produto', 'quantidade', 'valor'],
          properties: {
            produtos_id_produto: { type: 'integer', example: 1 },
            quantidade: { type: 'number', example: 2 },
            valor: { type: 'number', example: 299.9 },
          },
        },
        ItemPedidoResponse: {
          type: 'object',
          properties: {
            produtos_id_produto: { type: 'integer', example: 1 },
            produto_nome: { type: 'string', example: 'Raquete Butterfly Timo Boll' },
            quantidade: { type: 'number', example: 2 },
            valor: { type: 'number', example: 299.9 },
          },
        },
        PedidoInput: {
          type: 'object',
          required: ['clientes_id_cliente', 'itens'],
          properties: {
            data: {
              type: 'string',
              format: 'date',
              description: 'Data do pedido (YYYY-MM-DD). Se omitida, usa a data atual.',
              example: '2026-07-01',
            },
            clientes_id_cliente: { type: 'integer', example: 1 },
            itens: {
              type: 'array',
              items: { $ref: '#/components/schemas/ItemPedidoInput' },
            },
          },
        },
        PedidoResponse: {
          type: 'object',
          properties: {
            id_pedido: { type: 'integer', example: 1 },
            data: { type: 'string', format: 'date', example: '2026-07-01' },
            clientes_id_cliente: { type: 'integer', example: 1 },
            cliente_nome: { type: 'string', example: 'João Silva' },
            itens: {
              type: 'array',
              items: { $ref: '#/components/schemas/ItemPedidoResponse' },
            },
          },
        },

        // Erros
        ErroResponse: {
          type: 'object',
          properties: {
            msg: { type: 'string', example: 'Mensagem de erro descritiva' },
          },
        },
        ErroInterno: {
          type: 'object',
          properties: {
            erro: { type: 'string', example: 'Detalhe técnico do erro interno' },
          },
        },
      },
    },
    tags: [
      { name: 'Status', description: 'Rota pública de monitoramento (versão e status da API)' },
      { name: 'Autenticação', description: 'Endpoints de cadastro, login e logout de usuários' },
      { name: 'Categorias', description: 'CRUD de categorias (requer autenticação)' },
      { name: 'Produtos', description: 'CRUD de produtos (requer autenticação)' },
      { name: 'Clientes', description: 'CRUD de clientes (requer autenticação)' },
      { name: 'Pedidos', description: 'CRUD de pedidos com itens (requer autenticação)' },
    ],
  },
  // Arquivos que contêm as anotações @swagger / @openapi
  apis: [
    './src/routes/apiRoutes.js',
    './src/routes/usuarioRoutes.js',
    './src/routes/categoriaRoutes.js',
    './src/routes/produtoRoutes.js',
    './src/routes/clienteRoutes.js',
    './src/routes/pedidoRoutes.js',
  ],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
