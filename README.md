# PittaPong API REST

API REST para e-commerce de artigos esportivos de tênis de mesa.

Desenvolvida com **Node.js**, **Express**, **MySQL** e autenticação via **JWT (JSON Web Token)**.

> **Versão 2.0.0** — a camada de persistência foi migrada de **MongoDB** para um **SGBD relacional (MySQL)**,
> com as entidades **categorias**, **produtos**, **clientes** e **pedidos**.

---

## Tecnologias

- **Node.js** + **Express 5**
- **MySQL 8** + driver **mysql2** (Promises/async-await)
- **JWT** para autenticação
- **Bcrypt** para hash de senhas
- **Swagger (swagger-jsdoc + swagger-ui-express)** para documentação

---

## Instalação

```bash
# Clonar o repositório
git clone https://github.com/GabrielPittaBr/PittaPong2.0.git
cd PittaPongAPIRESTMYSQL

# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Copie o arquivo .env_exemplo para .env e preencha com seus dados
cp .env_exemplo .env
```

### Banco de dados

Importe o script relacional (cria a base `pittapong`, todas as tabelas — incluindo `usuarios` — e já popula com os dados reais fornecidos):

```bash
mysql -u root -p < database/pittapong.sql
```

### Variáveis de ambiente (`.env`)

```
PORT=3000

# Banco de dados relacional MySQL (base pittapong)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=pittapong

# Autenticação JWT
JWT_SECRET=sua_jwt_secret
```

---

## Executar

```bash
# Iniciar o servidor
npm start

# Popular o banco com dados de exemplo (usuário admin, categorias e produtos)
npm run seed
```

O seed cria um usuário administrador para login (senha com hash bcrypt):

- **nick:** `pittapong`
- **senha:** `PittaPong123!`

> A tabela `usuarios` segue o dump fornecido (`id_usuario`, `nome`, `nick`, `senha`). O usuário
> `candido` que vem no dump usa hash MD5 e **não** é compatível com o login (bcrypt); use o usuário
> semeado acima.

Documentação interativa (Swagger UI): **http://localhost:3000/api-docs**

---

## Autenticação e acesso estrito

A API utiliza **Bearer Token (JWT)** para proteger as rotas de CRUD.

### Fluxo

1. **Cadastre-se** (`POST /usuario/cadastro`) ou **faça login** (`POST /usuario/login`)
2. Copie o `token` retornado na resposta
3. Em todas as requisições protegidas, adicione o header:

```
Authorization: Bearer <seu_token_aqui>
```

### Regra de acesso estrito (requisito de segurança)

Os endpoints de CRUD (categorias, produtos, clientes, pedidos) só são processados quando **todas** as
condições abaixo são satisfeitas; caso contrário respondem **401 Unauthorized** ou **403 Forbidden**:

1. Há um **token JWT válido**;
2. O **id do usuário** está presente no payload do token (opcionalmente confirmado pelo header `x-user-id`);
3. Esse usuário **existe** na tabela `usuarios`.

> O header `x-user-id` é opcional. Se enviado, precisa ser igual ao id contido no token, senão a resposta é **403**.

---

## Endpoints

### Status (público)

| Método | Rota          | Auth | Descrição                          |
| ------ | ------------- | ---- | ---------------------------------- |
| GET    | `/api/status` | ❌   | Versão e status da API             |
| GET    | `/api/versao` | ❌   | Versão da API                      |

### Autenticação

| Método | Rota                | Auth | Descrição                           |
| ------ | ------------------- | ---- | ----------------------------------- |
| POST   | `/usuario/cadastro` | ❌   | Registrar novo usuário              |
| POST   | `/usuario/login`    | ❌   | Login — retorna token JWT           |
| POST   | `/usuario/logout`   | ❌   | Logout (simbólico em API stateless) |

### Categorias · Produtos · Clientes · Pedidos (todas exigem token)

| Método | Rota                | Descrição                        |
| ------ | ------------------- | -------------------------------- |
| GET    | `/categorias`       | Listar categorias                |
| GET    | `/categorias/:id`   | Obter categoria por ID           |
| POST   | `/categorias`       | Criar categoria                  |
| PUT    | `/categorias/:id`   | Atualizar categoria              |
| DELETE | `/categorias/:id`   | Excluir categoria                |
| GET    | `/produtos`         | Listar produtos (`?categoria=id`)|
| GET    | `/produtos/:id`     | Obter produto por ID             |
| POST   | `/produtos`         | Criar produto                    |
| PUT    | `/produtos/:id`     | Atualizar produto                |
| DELETE | `/produtos/:id`     | Excluir produto                  |
| GET    | `/clientes`         | Listar clientes                  |
| GET    | `/clientes/:id`     | Obter cliente por ID             |
| POST   | `/clientes`         | Criar cliente                    |
| PUT    | `/clientes/:id`     | Atualizar cliente                |
| DELETE | `/clientes/:id`     | Excluir cliente                  |
| GET    | `/pedidos`          | Listar pedidos                   |
| GET    | `/pedidos/:id`      | Obter pedido (com itens)         |
| POST   | `/pedidos`          | Criar pedido com itens           |
| PUT    | `/pedidos/:id`      | Atualizar pedido                 |
| DELETE | `/pedidos/:id`      | Excluir pedido                   |

---

## Exemplos de Uso

### 1. Login

```
POST /usuario/login
Content-Type: application/json

{
  "nick": "pittapong",
  "senha": "PittaPong123!"
}
```

**Resposta (200):**
```json
{
  "msg": "Login realizado com sucesso",
  "usuario": { "id": 2, "nome": "PittaPong Admin", "nick": "pittapong" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 2. Criar categoria (autenticado)

```
POST /categorias
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{ "nome": "Periféricos" }
```

### 3. Criar produto (autenticado)

```
POST /produtos
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "nome": "Teclado Mecânico RGB",
  "valor": 349.90,
  "estoque": 20,
  "categorias_id_categoria": 5
}
```

### 4. Criar cliente (autenticado)

```
POST /clientes
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{ "nome": "João Silva", "telefone": "11999998888", "status": "bom" }
```

### 5. Criar pedido com itens (autenticado)

```
POST /pedidos
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "data": "2026-07-01",
  "clientes_id_cliente": 1,
  "itens": [
    { "produtos_id_produto": 1, "quantidade": 2, "valor": 199.99 }
  ]
}
```

---

## Modelo de Dados (relacional)

### usuarios
`id_usuario` (PK) · `nome` · `nick` · `senha` (hash bcrypt)

### categorias
`id_categoria` (PK) · `nome`

### produtos
`id_produto` (PK) · `nome` · `valor` · `estoque` · `categorias_id_categoria` (FK → categorias)

### clientes
`id_cliente` (PK) · `nome` · `telefone` · `status` (`bom` | `medio` | `ruim`)

### pedidos
`id_pedido` (PK) · `data` · `clientes_id_cliente` (FK → clientes)

### produtos_pedidos (itens do pedido)
`produtos_id_produto` (FK → produtos) · `pedidos_id_pedido` (FK → pedidos) · `quantidade` · `valor`
— chave primária composta (`produtos_id_produto`, `pedidos_id_pedido`)

> O dump também contém a tabela `endereco` (vinculada a clientes), fora do escopo de CRUD desta versão.

---

## Segurança

- **Prepared Statements (`?`)** em todas as queries SQL (proteção contra SQL Injection).
- Senhas armazenadas com **hash bcrypt**.
- Rotas de CRUD protegidas por **JWT + validação estrita do usuário** (401/403).

---

## Autor

**Gabriel Fernandes Pitta** - [GitHub](https://github.com/GabrielPittaBr)
