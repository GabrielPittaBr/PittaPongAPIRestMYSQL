# Roteiro de Demonstração — PittaPong API (Migração para MySQL)

Guia passo a passo para apresentar os **critérios de aceite** ao professor.
Repositório: https://github.com/GabrielPittaBr/PittaPongAPIRestMYSQL

**Credenciais do usuário de teste (criado pelo `npm run seed`):**
- nick: `pittapong`
- senha: `PittaPong123!`

> O login é por **nick** (a tabela `usuarios` segue o dump do professor: `id_usuario, nome, nick, senha`).
> O usuário `candido` que vem no dump usa MD5 e não loga com bcrypt — use o `pittapong` acima.

**URLs úteis:**
- Rota de versão (pública): http://localhost:3000/api/status
- Swagger (documentação): http://localhost:3000/api-docs

---

## 0) Preparação (fazer ANTES de chamar o professor)

Deixe a API e o MySQL rodando com antecedência.

```bash
# Numa bancada nova do laboratório, a partir da pasta do projeto:

# 1. Instalar dependências
npm install

# 2. Importar o banco (cria a base pittapong + todas as tabelas, incluindo usuarios)
mysql -u root -p < database/pittapong.sql

# 3. Criar o arquivo .env a partir do exemplo e preencher usuário/senha do MySQL
cp .env_exemplo .env
#   editar .env: DB_USER, DB_PASSWORD (e conferir DB_HOST/DB_PORT/DB_NAME)

# 4. Criar o usuário administrador para login (os dados de negócio já vêm no dump)
npm run seed

# 5. Subir a API (porta 3000)
npm start
```

**Conteúdo esperado do `.env`:**
```
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=SUA_SENHA_MYSQL
DB_NAME=pittapong
JWT_SECRET=pittapong_dev_secret_2026
```

**O que dizer:** *"A API conecta no MySQL por um pool de conexões (`mysql2/promise`). Ela testa a conexão no boot — se o banco não conectar, o servidor nem sobe."*
→ Arquivos: `src/config/database.js` (pool + `testarConexao`) e `src/app.js` (boot).

---

## 1) Rota de Versão (acesso livre)

No **navegador**, abra:

```
http://localhost:3000/api/status
```

Resultado esperado:
```json
{ "versao": "2.0.0", "status": "online" }
```
(também funciona `http://localhost:3000/api/versao`)

**O que dizer:** *"Essa é uma rota pública de monitoramento — não passa pelo middleware de autenticação, de propósito. As rotas de CRUD (`/categorias`, `/produtos`...) exigem token; essa aqui é livre."*
→ Arquivo: `src/routes/apiRoutes.js`.

Bônus: mostre o **Swagger** em http://localhost:3000/api-docs e o botão **Authorize**.

---

## 2) Bloqueio de Invasão

Prova de que, sem **chave (token)** + **ID do usuário**, o sistema barra. Faça os 3 casos:

### Caso A — sem nenhuma credencial → barra (401)
```bash
curl -i http://localhost:3000/categorias
```
Esperado: `401 Unauthorized` → `{"msg":"Token não fornecido"}`

### Caso B — tentar CRIAR categoria sem token → barra (401)
```bash
curl -i -X POST http://localhost:3000/categorias -H "Content-Type: application/json" -d "{\"nome\":\"Invasao\"}"
```
Esperado: `401` (a categoria **não** é criada).

### Caso C — token válido, mas ID de usuário divergente → barra (403)
```bash
# 1. Fazer login e copiar o token:
curl -X POST http://localhost:3000/usuario/login -H "Content-Type: application/json" -d "{\"nick\":\"pittapong\",\"senha\":\"PittaPong123!\"}"

# 2. Usar o token com um x-user-id que NÃO bate com o do token:
curl -i -H "Authorization: Bearer SEU_TOKEN" -H "x-user-id: 9999" http://localhost:3000/categorias
```
Esperado: `403 Forbidden`.

### O que dizer (mostrando domínio)
> "O requisito exige duas coisas combinadas: a **chave** (token JWT no header `Authorization: Bearer`) e o **ID do usuário**. O ID vem dentro do payload do token; se o cliente enviar o header `x-user-id`, ele precisa bater com o ID do token. Além disso, o middleware confere se esse usuário **existe** na tabela `usuarios`. Faltando qualquer condição, retorna 401 ou 403 e a requisição nem chega ao controller."

→ Arquivos: `src/middlewares/authMiddleware.js` (os `return res.status(401/403)`) e `src/routes/categoriaRoutes.js` (`router.use(authMiddleware)` protege todas as rotas).

---

## 3) Persistência Efetiva (provar que gravou no MySQL)

Estratégia: mostrar a tabela **antes**, fazer a operação, mostrar **depois**. Deixe um terminal do MySQL aberto ao lado.

### 3.1 — Estado inicial da tabela
```bash
mysql -u root -p -D pittapong -e "SELECT * FROM categorias;"
```

### 3.2 — INSERIR via Swagger (visual, recomendado)
1. Abra http://localhost:3000/api-docs
2. `POST /usuario/login` → Execute → copie o `token`
3. Clique em **Authorize** (cadeado) → cole o token → Authorize
4. `POST /categorias` → Try it out → body `{"nome":"Periféricos"}` → Execute → resposta **201**

> Alternativa por curl:
> ```bash
> curl -X POST http://localhost:3000/categorias -H "Authorization: Bearer SEU_TOKEN" -H "Content-Type: application/json" -d "{\"nome\":\"Periféricos\"}"
> ```

### 3.3 — Provar no banco que gravou
```bash
mysql -u root -p -D pittapong -e "SELECT * FROM categorias WHERE nome='Periféricos';"
```
→ mostra a linha nova com o `id_categoria` gerado (anote esse id).

### 3.4 — ALTERAR (PUT) e provar de novo
```bash
# troque 12 pelo id que apareceu acima:
curl -X PUT http://localhost:3000/categorias/12 -H "Authorization: Bearer SEU_TOKEN" -H "Content-Type: application/json" -d "{\"nome\":\"Periféricos e Cabos\"}"
```
```bash
mysql -u root -p -D pittapong -e "SELECT * FROM categorias WHERE id_categoria=12;"
```
→ o `nome` mudou para "Periféricos e Cabos".

**O que dizer:** *"O dado foi gravado no MySQL, não em memória. Cada controller chama o model, que executa SQL com **prepared statements** (os `?`), o que impede SQL Injection."*
→ Arquivo: `src/models/categoriaModel.js` — `INSERT INTO categorias (nome) VALUES (?)` e `UPDATE ... WHERE id_categoria = ?`.

> **Observação sobre o nome da tabela:** o enunciado cita `tabela_categorias`, mas o script fornecido (`pittapong.sql`) nomeia a tabela como **`categorias`**. Avise o professor para evitar dúvida.

---

## 4) Formato de Entrega (link + histórico)

- **Link do repositório:** https://github.com/GabrielPittaBr/PittaPongAPIRestMYSQL
- **Histórico da migração (no terminal):**
  ```bash
  git log --oneline --graph -15
  ```
- Ou no GitHub: mostrar os commits da branch `refactor/migracao-para-mysql` e os merges em `develop` → `main`.

**O que dizer:** *"Fiz a migração numa branch dedicada, com um commit por etapa (infra MySQL, autenticação, cada CRUD, Swagger, README) e depois integrei via `develop` → `main`."*

---

## Perguntas prováveis do professor — respostas curtas

- **"Cadê o MongoDB?"** → Removi `mongoose` e o Cloudinary. A conexão agora é um pool `mysql2`. O schema relacional de `produtos` não tinha coluna de imagem, então tirei o upload.
- **"Como protege contra SQL Injection?"** → Prepared statements (`?`) em todas as queries; os valores nunca são concatenados na string SQL.
- **"E os pedidos, que têm itens?"** → `POST /pedidos` grava em `pedidos` e `produtos_pedidos` dentro de uma **transação** (`beginTransaction`/`commit`/`rollback`): ou grava tudo, ou nada. Ver `src/models/pedidoModel.js`.
- **"Onde ficam as credenciais?"** → No `.env`, fora do Git (via `.gitignore`). O repositório só tem o `.env_exemplo`.
- **"O que é o header `x-user-id`?"** → É a forma opcional de o cliente informar explicitamente o ID; se enviado, tem que bater com o ID de dentro do token. Mesmo sem ele, o ID já é validado a partir do payload do token.

---

## Checklist rápido (marcar durante a demo)

- [ ] `/api/status` abre no navegador e mostra a versão
- [ ] `GET /categorias` sem token → 401
- [ ] `POST /categorias` sem token → 401
- [ ] token válido + `x-user-id` errado → 403
- [ ] login OK → token copiado → Authorize no Swagger
- [ ] `POST /categorias` com token → 201 e linha aparece no `SELECT`
- [ ] `PUT /categorias/:id` com token → nome alterado no `SELECT`
- [ ] histórico de commits mostrado (git log / GitHub)
