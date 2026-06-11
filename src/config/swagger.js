const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PittaPong REST API',
      version: '1.1.0',
      description:
        'API REST de e-commerce de artigos esportivos de tênis de mesa. ' +
        'Permite gerenciar produtos e autenticar usuários via JWT. ' +
        'Para acessar rotas protegidas, realize o login e utilize o token no botão **Authorize** acima.',
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
        // Usuário
        CadastroInput: {
          type: 'object',
          required: ['nome', 'email', 'senha'],
          properties: {
            nome: {
              type: 'string',
              example: 'Gabriel Pitta',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'gabriel@example.com',
            },
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
            email: {
              type: 'string',
              format: 'email',
              example: 'gabriel@example.com',
            },
            senha: {
              type: 'string',
              format: 'password',
              example: 'minhasenha123',
            },
          },
        },
        UsuarioResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '6650f2a1b4e2c12345678901',
            },
            nome: {
              type: 'string',
              example: 'Gabriel Pitta',
            },
            email: {
              type: 'string',
              example: 'gabriel@example.com',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            msg: {
              type: 'string',
              example: 'Login realizado com sucesso',
            },
            usuario: {
              $ref: '#/components/schemas/UsuarioResponse',
            },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },

        // Produto
        ProdutoInput: {
          type: 'object',
          required: ['nome', 'preco', 'descricao'],
          properties: {
            nome: {
              type: 'string',
              maxLength: 80,
              example: 'Raquete Butterfly Timo Boll',
            },
            preco: {
              type: 'number',
              format: 'float',
              example: 299.9,
            },
            descricao: {
              type: 'string',
              maxLength: 200,
              example: 'Raquete profissional para jogadores avançados.',
            },
            categoria: {
              type: 'string',
              enum: ['Raquetes', 'Bolinhas', 'Redes', 'Acessórios', 'Outros'],
              default: 'Outros',
              example: 'Raquetes',
            },
          },
        },
        ProdutoPatchInput: {
          type: 'object',
          description: 'Pelo menos um campo deve ser informado.',
          properties: {
            nome: {
              type: 'string',
              maxLength: 80,
              example: 'Raquete Donic Waldner',
            },
            preco: {
              type: 'number',
              format: 'float',
              example: 189.5,
            },
            descricao: {
              type: 'string',
              maxLength: 200,
              example: 'Raquete de alta performance para competições.',
            },
            categoria: {
              type: 'string',
              enum: ['Raquetes', 'Bolinhas', 'Redes', 'Acessórios', 'Outros'],
              example: 'Raquetes',
            },
            imagens: {
              type: 'array',
              items: { type: 'string', format: 'uri' },
              example: ['https://res.cloudinary.com/example/image/upload/v1/produtos/foto.jpg'],
            },
          },
        },
        ProdutoResponse: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '6650f3b2c1d3e45678901234',
            },
            usuario: {
              type: 'string',
              example: '6650f2a1b4e2c12345678901',
            },
            nome: {
              type: 'string',
              example: 'Raquete Butterfly Timo Boll',
            },
            preco: {
              type: 'number',
              example: 299.9,
            },
            descricao: {
              type: 'string',
              example: 'Raquete profissional para jogadores avançados.',
            },
            categoria: {
              type: 'string',
              example: 'Raquetes',
            },
            imagens: {
              type: 'array',
              items: { type: 'string' },
              example: ['https://res.cloudinary.com/example/image/upload/v1/produtos/foto.jpg'],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-06-11T10:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-06-11T10:00:00.000Z',
            },
          },
        },

        // Erros
        ErroResponse: {
          type: 'object',
          properties: {
            msg: {
              type: 'string',
              example: 'Mensagem de erro descritiva',
            },
          },
        },
        ErroInterno: {
          type: 'object',
          properties: {
            erro: {
              type: 'string',
              example: 'Detalhe técnico do erro interno',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Autenticação',
        description: 'Endpoints de cadastro, login e logout de usuários',
      },
      {
        name: 'Produtos',
        description: 'CRUD completo de produtos esportivos de tênis de mesa',
      },
    ],
  },
  // Arquivos que contêm as anotações @swagger / @openapi
  apis: [
    './src/routes/userRoutes.js',
    './src/routes/productRoutes.js',
  ],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
