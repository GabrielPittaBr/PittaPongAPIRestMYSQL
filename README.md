<div align="center">

# 🏓 PittaPong API REST

**API REST para e-commerce de artigos esportivos de tênis de mesa**

CRUD completo de categorias, produtos, clientes e pedidos — com autenticação JWT,
persistência em MySQL e documentação interativa via Swagger.

<br>

![Node.js](https://img.shields.io/badge/Node.js-20%20%7C%2024-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)

![Render](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)
![Aiven](https://img.shields.io/badge/DB-Aiven-FF3554?style=for-the-badge&logo=aiven&logoColor=white)
![Version](https://img.shields.io/badge/version-2.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-ISC-green?style=for-the-badge)

<br>

**[🌐 API ao vivo](https://pittapongapirestmysql.onrender.com)** ·
**[📖 Swagger UI](https://pittapongapirestmysql.onrender.com/api-docs)** ·
**[📡 Endpoints](#-endpoints)** ·
**[☁️ Deploy](#️-deploy-em-nuvem-aiven--render--vercel)**

</div>

> [!NOTE]
> **Versão 2.0.0** — a camada de persistência foi migrada de **MongoDB** para um **SGBD relacional
> (MySQL)**, com as entidades **categorias**, **produtos**, **clientes** e **pedidos**.

---

## 📑 Índice

- [🌐 Ambiente publicado](#-ambiente-publicado)
- [✨ Recursos](#-recursos)
- [🧰 Stack](#-stack)
- [🚀 Quickstart](#-quickstart)
- [⚙️ Variáveis de ambiente](#️-variáveis-de-ambiente)
- [📡 Endpoints](#-endpoints)
- [🔐 Autenticação e acesso estrito](#-autenticação-e-acesso-estrito)
- [🧪 Exemplos de uso](#-exemplos-de-uso)
- [🗄️ Modelo de dados](#️-modelo-de-dados-relacional)
- [🛡️ Segurança](#️-segurança)
- [☁️ Deploy em nuvem](#️-deploy-em-nuvem-aiven--render--vercel)
- [📁 Estrutura do projeto](#-estrutura-do-projeto)
- [📚 Documentação adicional](#-documentação-adicional)

---

## 🌐 Ambiente publicado

| Camada | Serviço | Link |
| ------ | ------- | ---- |
| **API REST** | Render | <https://pittapongapirestmysql.onrender.com> |
| **Documentação (Swagger UI)** | Render | <https://pittapongapirestmysql.onrender.com/api-docs> |
| **Banco de dados** | Aiven (MySQL 8.4) | base `pittapong`, TLS obrigatório |

**Como testar em 30 segundos:**

1. Abra o [Swagger UI](https://pittapongapirestmysql.onrender.com/api-docs)
2. Execute `POST /usuario/login` com `pittapong` / `PittaPong123!`
3. Copie o `token` da resposta e cole no botão **Authorize** 🔓
4. As rotas de CRUD passam a responder

> [!WARNING]
> O plano Free do Render hiberna o serviço após inatividade. A primeira requisição depois disso
> pode levar dezenas de segundos; as seguintes são normais.

---

## ✨ Recursos

- 🗃️ **CRUD completo** de quatro entidades — categorias, produtos, clientes e pedidos
- 🔐 **Autenticação JWT** com regra de **acesso estrito**: token válido + usuário existente no banco
- 🧾 **Pedidos com itens** criados, atualizados e removidos dentro de **transações SQL**
- 💰 **Preço calculado no servidor** — o cliente envia só produto e quantidade; a API busca o valor
  unitário no banco e devolve `subtotal` por item e `total` do pedido
- 🔎 **Filtro por categoria** em `GET /produtos?categoria=<id>` e `JOIN`s nas consultas de detalhe
- 🛡️ **Prepared statements** em todas as queries e senhas com **hash bcrypt**
- 📖 **Swagger UI** interativo, com o servidor de produção detectado automaticamente
- ☁️ **Pronto para nuvem** — TLS no banco, CORS configurável e porta injetada pela plataforma

---

## 🧰 Stack

| Camada | Tecnologia | Versão |
| ------ | ---------- | ------ |
| Runtime | **Node.js** | `>=20.0.0 <25` |
| Framework | **Express** | `^5.2.1` |
| Banco de dados | **MySQL** | `8.x` |
| Driver | **mysql2** (Promises / async-await) | `^3.11.0` |
| Autenticação | **jsonwebtoken** | `^9.0.3` |
| Hash de senhas | **bcrypt** | `^6.0.0` |
| Documentação | **swagger-jsdoc** + **swagger-ui-express** | `^6.3.0` / `^5.0.1` |
| Suporte | **cors**, **dotenv** | `^2.8.6` / `^17.4.2` |
| Formatação | **prettier** | `^3.8.3` |

> Sem ORM: os models usam SQL puro com prepared statements.

---

## 🚀 Quickstart

**Pré-requisitos:** Node.js 20+ (até 24) e um servidor MySQL 8.

```bash
# 1. Clonar o repositório
git clone https://github.com/GabrielPittaBr/PittaPongAPIRestMYSQL.git
cd PittaPongAPIRestMYSQL

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env_exemplo .env      # depois edite o .env com seus dados

# 4. Importar o schema (cria a base `pittapong`, as tabelas e os dados iniciais)
mysql -u root -p < database/pittapong.sql

# 5. Subir a API
npm start

# 6. Criar o usuário administrador (idempotente — pode rodar de novo sem problema)
npm run seed
```

🔑 **Credenciais criadas pelo seed** (senha com hash bcrypt):

| Campo | Valor |
| ----- | ----- |
| `nick` | `pittapong` |
| `senha` | `PittaPong123!` |

📖 Documentação interativa local: **<http://localhost:3000/api-docs>**

---

## ⚙️ Variáveis de ambiente

O arquivo `.env_exemplo` documenta o conjunto completo.

| Variável | Obrigatória | Padrão | Descrição |
| -------- | :---------: | ------ | --------- |
| `PORT` | ❌ | `3000` | Porta HTTP. Em produção é **injetada pelo Render** |
| `DB_HOST` | ✅ | — | Host do MySQL |
| `DB_PORT` | ❌ | `3306` | Porta do MySQL |
| `DB_USER` | ✅ | — | Usuário do banco |
| `DB_PASSWORD` | ✅ | — | Senha do banco |
| `DB_NAME` | ✅ | — | Nome da base (`pittapong`) |
| `JWT_SECRET` | ✅ | — | Segredo de assinatura do JWT (expiração de 1 dia) |
| `DB_SSL` | ❌ | desligado | `true` habilita TLS na conexão com o banco |
| `DB_SSL_CA` | ⚠️ | — | Conteúdo do `ca.pem`. **Obrigatória quando `DB_SSL=true`** — sem ela a aplicação falha no boot |
| `API_PUBLIC_URL` | ❌ | — | URL pública; entra como primeiro servidor no Swagger |
| `CORS_ORIGIN` | ❌ | tudo liberado | Origens permitidas, separadas por vírgula |

Exemplo mínimo para desenvolvimento local:

```env
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

> As variáveis de nuvem (`DB_SSL`, `DB_SSL_CA`, `API_PUBLIC_URL`, `CORS_ORIGIN`) são opcionais e,
> quando ausentes, a aplicação se comporta exatamente como antes.
> Veja [Deploy em nuvem](#️-deploy-em-nuvem-aiven--render--vercel).

---

## 📡 Endpoints

### 🔓 Públicas

| Método | Rota | Descrição |
| :----: | ---- | --------- |
| `GET` | `/` | Informações da API e índice de endpoints |
| `GET` | `/api/status` | Versão e status da API |
| `GET` | `/api/versao` | Versão da API |
| `GET` | `/api-docs` | Swagger UI |

### 🔑 Autenticação

| Método | Rota | Descrição |
| :----: | ---- | --------- |
| `POST` | `/usuario/cadastro` | Registrar novo usuário — retorna token (`409` se o nick já existe) |
| `POST` | `/usuario/login` | Login — retorna token JWT (`404` sem usuário, `401` senha inválida) |
| `POST` | `/usuario/logout` | Logout (simbólico em API stateless) |

### 🔒 CRUD — exigem `Authorization: Bearer <token>`

<table>
<tr><th>Categorias</th><th>Produtos</th></tr>
<tr valign="top"><td>

| Método | Rota |
| :----: | ---- |
| `GET` | `/categorias` |
| `GET` | `/categorias/:id` |
| `POST` | `/categorias` |
| `PUT` | `/categorias/:id` |
| `DELETE` | `/categorias/:id` |

</td><td>

| Método | Rota |
| :----: | ---- |
| `GET` | `/produtos` |
| `GET` | `/produtos/:id` |
| `POST` | `/produtos` |
| `PUT` | `/produtos/:id` |
| `DELETE` | `/produtos/:id` |

</td></tr>
<tr><th>Clientes</th><th>Pedidos</th></tr>
<tr valign="top"><td>

| Método | Rota |
| :----: | ---- |
| `GET` | `/clientes` |
| `GET` | `/clientes/:id` |
| `POST` | `/clientes` |
| `PUT` | `/clientes/:id` |
| `DELETE` | `/clientes/:id` |

</td><td>

| Método | Rota |
| :----: | ---- |
| `GET` | `/pedidos` |
| `GET` | `/pedidos/:id` |
| `POST` | `/pedidos` |
| `PUT` | `/pedidos/:id` |
| `DELETE` | `/pedidos/:id` |

</td></tr>
</table>

**Detalhes que valem conhecer:**

- `GET /produtos` aceita o filtro **`?categoria=<id>`**
- `GET /produtos/:id` traz a categoria via `JOIN`; `GET /pedidos` traz o nome do cliente
- `GET /pedidos/:id` retorna o pedido **com seus itens**, cada um com `subtotal`, mais o `total`
- Nos itens de pedido, envie apenas `produtos_id_produto` e `quantidade` — o **preço unitário é
  definido pelo servidor** a partir do cadastro do produto
- `POST`, `PUT` e `DELETE` de pedidos rodam em **transação** — o `PUT` substitui os itens quando um
  array `itens` é enviado

---

## 🔐 Autenticação e acesso estrito

<details>
<summary><b>Fluxo de autenticação e as três condições de acesso</b></summary>

<br>

A API utiliza **Bearer Token (JWT)** para proteger as rotas de CRUD.

### Fluxo

1. **Cadastre-se** (`POST /usuario/cadastro`) ou **faça login** (`POST /usuario/login`)
2. Copie o `token` retornado na resposta
3. Em todas as requisições protegidas, adicione o header:

```http
Authorization: Bearer <seu_token_aqui>
```

### Regra de acesso estrito (requisito de segurança)

Os endpoints de CRUD (categorias, produtos, clientes, pedidos) só são processados quando **todas** as
condições abaixo são satisfeitas; caso contrário respondem **`401 Unauthorized`** ou
**`403 Forbidden`**:

| # | Condição |
| - | -------- |
| 1 | Há um **token JWT válido** |
| 2 | O **id do usuário** está presente no payload do token (opcionalmente confirmado pelo header `x-user-id`) |
| 3 | Esse usuário **existe** na tabela `usuarios` |

> O header `x-user-id` é opcional. Se enviado, precisa ser igual ao id contido no token, senão a
> resposta é **`403`**.

</details>

---

## 🧪 Exemplos de uso

<details>
<summary><b>Login, categoria, produto, cliente e pedido com itens</b></summary>

<br>

### 1. Login

```http
POST /usuario/login
Content-Type: application/json

{
  "nick": "pittapong",
  "senha": "PittaPong123!"
}
```

**Resposta (`200`):**

```json
{
  "msg": "Login realizado com sucesso",
  "usuario": { "id": 2, "nome": "PittaPong Admin", "nick": "pittapong" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 2. Criar categoria (autenticado)

```http
POST /categorias
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{ "nome": "Periféricos" }
```

### 3. Criar produto (autenticado)

```http
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

```http
POST /clientes
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{ "nome": "João Silva", "telefone": "11999998888", "status": "bom" }
```

### 5. Criar pedido com itens (autenticado)

```http
POST /pedidos
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "data": "2026-07-01",
  "clientes_id_cliente": 1,
  "itens": [
    { "produtos_id_produto": 1, "quantidade": 2 }
  ]
}
```

> O preço **não** é enviado pelo cliente: a API busca o `valor` atual do produto no banco.

**Resposta (`201`):**

```json
{
  "msg": "Pedido criado com sucesso",
  "pedido": {
    "id_pedido": 7,
    "data": "2026-07-01",
    "clientes_id_cliente": 1,
    "cliente_nome": "João Silva",
    "itens": [
      {
        "produtos_id_produto": 1,
        "produto_nome": "Notebook HP 256R-G9",
        "quantidade": 2,
        "valor": 4578,
        "subtotal": 9156
      }
    ],
    "total": 9156
  }
}
```

</details>

---

## 🗄️ Modelo de dados (relacional)

<details>
<summary><b>Tabelas, chaves e relacionamentos</b></summary>

<br>

| Tabela | Colunas |
| ------ | ------- |
| **usuarios** | `id_usuario` 🔑 · `nome` · `nick` (único) · `senha` (hash bcrypt) |
| **categorias** | `id_categoria` 🔑 · `nome` |
| **produtos** | `id_produto` 🔑 · `nome` · `valor` · `estoque` · `categorias_id_categoria` 🔗 → `categorias` |
| **clientes** | `id_cliente` 🔑 · `nome` · `telefone` · `status` (`bom` \| `medio` \| `ruim`) |
| **pedidos** | `id_pedido` 🔑 · `data` · `clientes_id_cliente` 🔗 → `clientes` |
| **produtos_pedidos** | `produtos_id_produto` 🔗 → `produtos` · `pedidos_id_pedido` 🔗 → `pedidos` · `quantidade` · `valor` |

🔑 chave primária · 🔗 chave estrangeira

**Relacionamentos:**

```
categorias 1 ──< N produtos
clientes   1 ──< N pedidos
pedidos    N >──< N produtos   (via produtos_pedidos)
```

> `produtos_pedidos` usa **chave primária composta** (`produtos_id_produto`, `pedidos_id_pedido`).
>
> O dump também contém a tabela `endereco` (vinculada a clientes), **fora do escopo de CRUD** desta
> versão.

</details>

---

## 🛡️ Segurança

<details>
<summary><b>Medidas aplicadas</b></summary>

<br>

| Medida | Detalhe |
| ------ | ------- |
| 💉 **SQL Injection** | Prepared statements (`?`) em **todas** as queries |
| 🔒 **Senhas** | Armazenadas com hash **bcrypt** |
| 🎫 **Rotas de CRUD** | Protegidas por **JWT + validação estrita do usuário** (`401` / `403`) |
| 🌍 **CORS** | Restrito às origens de `CORS_ORIGIN` em produção |
| 🔐 **TLS** | Obrigatório na conexão com o banco em nuvem, com validação do certificado CA |

</details>

---

## ☁️ Deploy em nuvem (Aiven · Render · Vercel)

<details>
<summary><b>Guia completo: banco, API e verificação pós-deploy</b></summary>

<br>

Arquitetura em três camadas:

```
┌─────────────┐      ┌──────────────┐      ┌───────────────┐
│   Vercel    │─────▶│    Render    │─────▶│     Aiven     │
│  front-end  │ HTTPS│   API REST   │  TLS │   MySQL 8.4   │
│ (planejado) │      │   Express 5  │      │  base pittapong│
└─────────────┘      └──────────────┘      └───────────────┘
```

### 1️⃣ Banco de dados (Aiven)

Crie um serviço MySQL no Aiven e carregue o schema. O mesmo script usado localmente funciona na
nuvem — o `avnadmin` tem permissão para criar a base `pittapong`:

```bash
mysql --host=<host>.aivencloud.com --port=<porta> --user=avnadmin --password \
      --ssl-mode=REQUIRED defaultdb < database/pittapong.sql
```

> As tabelas são criadas na base **`pittapong`**, não em `defaultdb`. Use `DB_NAME=pittapong`.

Baixe o **CA certificate** (`ca.pem`) no painel do serviço — ele vai para a variável `DB_SSL_CA`.

Em seguida, com o `.env` local apontando para o Aiven, crie o usuário administrador:

```bash
npm run seed
```

### 2️⃣ API REST (Render)

Crie um **Web Service** apontando para este repositório:

| Configuração | Valor |
| ------------ | ----- |
| Build command | `npm install` |
| Start command | `npm start` |
| Root directory | (raiz do repo) |

Variáveis de ambiente no painel do Render:

| Variável | Valor |
| -------- | ----- |
| `DB_HOST` | host do serviço Aiven |
| `DB_PORT` | porta do serviço Aiven |
| `DB_USER` | `avnadmin` |
| `DB_PASSWORD` | senha do Aiven |
| `DB_NAME` | `pittapong` |
| `DB_SSL` | `true` |
| `DB_SSL_CA` | conteúdo integral do `ca.pem` (valor multilinha) |
| `JWT_SECRET` | segredo forte, **diferente** do usado localmente |
| `API_PUBLIC_URL` | URL pública do serviço, ex: `https://x.onrender.com` |
| `CORS_ORIGIN` | URL do front-end na Vercel (opcional — ver abaixo) |

> [!IMPORTANT]
> - `PORT` é injetada automaticamente pelo Render — **não** a configure manualmente.
> - `CORS_ORIGIN` só é necessária quando existir um front-end. Enquanto estiver ausente, a API
>   aceita requisições de qualquer origem, o que mantém o Swagger UI e os testes manuais
>   funcionando normalmente.
> - `API_PUBLIC_URL` só é conhecida após o primeiro deploy. Configure-a e faça um novo deploy para
>   que o Swagger UI passe a apontar para o ambiente publicado.

### 3️⃣ Verificação pós-deploy

- [ ] `GET /api/status` → `200`
- [ ] `/api-docs` carrega e o seletor de servidor mostra a URL pública em primeiro lugar
- [ ] `GET /categorias` sem token → `401`
- [ ] Login em `/usuario/login`, **Authorize** no Swagger, `GET /categorias` → `200`
- [ ] Criar um registro e relistá-lo confirma a persistência no Aiven

</details>

---

## 📁 Estrutura do projeto

<details>
<summary><b>Árvore de diretórios</b></summary>

<br>

```
PittaPongAPIRestMYSQL/
├── src/
│   ├── app.js                  # Bootstrap do Express: CORS, JSON, Swagger, rotas, listen
│   ├── seed.js                 # Seed idempotente do usuário administrador
│   ├── config/
│   │   ├── database.js         # Pool mysql2/promise + TLS + teste de conexão
│   │   ├── cors.js             # Política de CORS a partir de CORS_ORIGIN
│   │   └── swagger.js          # Especificação OpenAPI (schemas, bearerAuth, servers)
│   ├── routes/                 # Definição das rotas + anotações @swagger
│   ├── controllers/            # Validação de entrada e respostas HTTP
│   ├── models/                 # SQL puro com prepared statements
│   └── middlewares/
│       └── authMiddleware.js   # Verificação do JWT + checagem do usuário no banco
├── database/
│   └── pittapong.sql           # Dump MySQL: base, tabelas e dados iniciais
├── docs/                       # Especificação e resumo do deploy em nuvem
├── ROTEIRO-DEMO.md             # Roteiro de demonstração da API
└── .env_exemplo                # Modelo de variáveis de ambiente
```

</details>

---

## 📚 Documentação adicional

| Documento | Conteúdo |
| --------- | -------- |
| [`docs/DEPLOY.md`](docs/DEPLOY.md) | Resumo das alterações que prepararam a API para a nuvem |
| [`docs/specs/deploy-cloud-aiven-render.md`](docs/specs/deploy-cloud-aiven-render.md) | Especificação de design do deploy Aiven + Render |
| [`ROTEIRO-DEMO.md`](ROTEIRO-DEMO.md) | Roteiro passo a passo para demonstrar a API |

---

<div align="center">

## 👤 Autor

**Gabriel Fernandes Pitta**

[![GitHub](https://img.shields.io/badge/GitHub-GabrielPittaBr-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/GabrielPittaBr)

<sub>Licenciado sob ISC · PittaPong API REST v2.0.0</sub>

</div>
