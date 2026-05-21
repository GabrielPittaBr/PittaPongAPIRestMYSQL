# PittaPong API REST

API REST para e-commerce de artigos esportivos de tênis de mesa.

Desenvolvida com **Node.js**, **Express**, **MongoDB** e autenticação via **JWT (JSON Web Token)**.

---

## Tecnologias

- **Node.js** + **Express 5**
- **MongoDB** + **Mongoose**
- **JWT** para autenticação
- **Cloudinary** para upload de imagens
- **Multer** para processamento de arquivos
- **Bcrypt** para hash de senhas

---

## Instalação

```bash
# Clonar o repositório
git clone https://github.com/GabrielPittaBr/PittaPongAPIrest.git
cd PittaPongAPIrest

# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Copie o arquivo .env_exemplo para .env e preencha com seus dados
cp .env_exemplo .env
```

### Variáveis de ambiente (`.env`)

```
PORT=3000
MONGO_URI=sua_string_do_mongodb
CLOUD_NAME=seu_cloud_name_cloudinary
API_KEY=sua_api_key_cloudinary
API_SECRET=seu_api_secret_cloudinary
JWT_SECRET=sua_jwt_secret
```

---

## Executar

```bash
# Iniciar o servidor
npm start

# Popular o banco com dados de exemplo
npm run seed
```

---

## Autenticação

A API utiliza **Bearer Token (JWT)** para proteger rotas.

### Fluxo:

1. **Registre-se** ou **faça login** via POST
2. Copie o `token` retornado na resposta
3. Em todas as requisições protegidas, adicione o header:

```
Authorization: Bearer <seu_token_aqui>
```

---

## Endpoints

### Usuário

| Método | Rota                | Auth | Descrição                              |
| ------ | ------------------- | ---- | -------------------------------------- |
| POST   | `/usuario/cadastro` | ❌   | Registrar novo usuário                 |
| POST   | `/usuario/login`    | ❌   | Login — retorna token JWT              |
| POST   | `/usuario/logout`   | ❌   | Logout (simbólico em API stateless)    |

### Produtos

| Método | Rota              | Auth | Descrição                                      |
| ------ | ----------------- | ---- | ---------------------------------------------- |
| GET    | `/produtos`       | ❌   | Listar todos (filtro opcional: `?categoria=`)  |
| GET    | `/produtos/:id`   | ❌   | Obter produto por ID                           |
| POST   | `/produtos`       | ✅   | Criar produto (multipart com imagens)          |
| PUT    | `/produtos/:id`   | ✅   | Atualizar produto por completo (com imagens)   |
| PATCH  | `/produtos/:id`   | ✅   | Atualizar produto parcialmente (JSON body)     |
| DELETE | `/produtos/:id`   | ✅   | Deletar produto                                |

---

## Exemplos de Uso (Talend API / Postman)

### 1. Registrar usuário

```
POST /usuario/cadastro
Content-Type: application/json

{
  "nome": "Gabriel",
  "email": "gabriel@email.com",
  "senha": "minhaSenha123"
}
```

**Resposta (201):**
```json
{
  "msg": "Usuário cadastrado com sucesso",
  "usuario": {
    "id": "664...",
    "nome": "Gabriel",
    "email": "gabriel@email.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 2. Login

```
POST /usuario/login
Content-Type: application/json

{
  "email": "gabriel@email.com",
  "senha": "minhaSenha123"
}
```

**Resposta (200):**
```json
{
  "msg": "Login realizado com sucesso",
  "usuario": {
    "id": "664...",
    "nome": "Gabriel",
    "email": "gabriel@email.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 3. Criar produto (autenticado)

```
POST /produtos
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: multipart/form-data

nome: Raquete Pro
preco: 199.99
descricao: Raquete profissional de alta qualidade
categoria: Raquetes
imagens: [arquivo1.jpg, arquivo2.jpg]
```

### 4. Listar produtos

```
GET /produtos
GET /produtos?categoria=Raquetes
```

### 5. Obter produto por ID

```
GET /produtos/664abc123def456...
```

### 6. Atualizar produto (PUT - completo)

```
PUT /produtos/664abc123def456...
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: multipart/form-data

nome: Raquete Pro V2
preco: 249.99
descricao: Versão atualizada da raquete profissional
categoria: Raquetes
```

### 7. Atualizar produto (PATCH - parcial)

```
PATCH /produtos/664abc123def456...
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "preco": 189.99
}
```

### 8. Deletar produto

```
DELETE /produtos/664abc123def456...
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## Categorias Disponíveis

- `Raquetes`
- `Bolinhas`
- `Redes`
- `Acessórios`
- `Outros`

---

## Modelo de Dados

### Usuário

```json
{
  "nome": "String (obrigatório)",
  "email": "String (obrigatório, único)",
  "senha": "String (obrigatório, hash bcrypt)"
}
```

### Produto

```json
{
  "usuario": "ObjectId (ref: Usuario, obrigatório)",
  "nome": "String (obrigatório, max: 80)",
  "preco": "Number (obrigatório)",
  "descricao": "String (obrigatório, max: 200)",
  "categoria": "String (enum: Raquetes|Bolinhas|Redes|Acessórios|Outros)",
  "imagens": ["String (URLs do Cloudinary)"]
}
```

---

## Autor

**Gabriel Fernandes Pitta** - [GitHub](https://github.com/GabrielPittaBr)
