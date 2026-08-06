# Deploy em nuvem — resumo das alterações

Registro do que foi feito para levar a API do ambiente local para a nuvem, na branch
`feature/deploy-cloud`.

## Ambiente publicado

| Camada | Serviço | Endereço |
| --- | --- | --- |
| API REST | Render | https://pittapongapirestmysql.onrender.com |
| Documentação | Swagger UI | https://pittapongapirestmysql.onrender.com/api-docs |
| Persistência | Aiven (MySQL 8.4) | base `pittapong`, TLS obrigatório |
| Front-end | Vercel | pendente |

## Princípio da migração

Nenhum contrato de endpoint mudou. Toda a diferença entre rodar local e rodar em produção
passou a ser expressa por variáveis de ambiente — e, quando elas estão ausentes, a
aplicação se comporta exatamente como antes da migração. As mudanças são aditivas.

## O que mudou

### `src/config/database.js` — TLS na conexão

A opção `ssl` do pool `mysql2` passou a ser montada a partir do ambiente. Sem `DB_SSL`, a
opção fica ausente e a conexão local segue sem TLS. Com `DB_SSL` ativo, o certificado CA do
provedor é lido de `DB_SSL_CA` e o certificado do servidor é validado de fato
(`rejectUnauthorized: true`). Se `DB_SSL` estiver ativo sem o CA, a aplicação falha no boot
com mensagem explícita em vez de conectar sem verificação.

### `src/config/cors.js` — política de CORS (novo)

`CORS_ORIGIN` aceita uma lista de origens separadas por vírgula, comparadas exatamente
(protocolo + host + porta). Sem a variável, qualquer origem é liberada — o modo de
desenvolvimento. `Authorization` está entre os cabeçalhos permitidos, sem o que o
front-end não conseguiria enviar o token JWT.

Requisições **sem** cabeçalho `Origin` são sempre permitidas. Não é uma brecha: são
chamadas que não partem de navegador (Swagger UI, `curl`, Postman, health checks), onde a
política de mesma origem não se aplica. Bloqueá-las quebraria o próprio `/api-docs`.

### `src/config/swagger.js` — documentação apontando para produção

A lista `servers` passou a ser dinâmica: quando `API_PUBLIC_URL` existe, ela entra em
primeiro lugar e vira a seleção padrão do Swagger UI, de modo que **Try it out** dispara
requisições contra o ambiente publicado, e não contra o `localhost` de quem abre a página.

Os caminhos das anotações `@swagger` passaram a ser resolvidos a partir do próprio módulo,
e não do diretório de trabalho do processo. Com caminhos relativos, a documentação subiria
vazia caso a plataforma iniciasse o processo fora da raiz do repositório — falha silenciosa,
já que a API continuaria respondendo normalmente.

### `src/app.js` — boot e links

`listen` explícito em `0.0.0.0`; o link de documentação da rota raiz deixou de ser
`http://localhost:3000` fixo e passou a derivar de `API_PUBLIC_URL` (ou do host da
requisição); log de boot informa o modo de CORS ativo.

### `package.json`

Campo `engines` fixando a major do Node — `bcrypt` é módulo nativo, e deixar a plataforma
escolher a versão é causa clássica de falha de build. Dependência `cors` adicionada. URLs
do repositório corrigidas (apontavam para `PittaPong2.0`).

## Banco de dados

O script `database/pittapong.sql` roda no Aiven **sem alteração**: o usuário `avnadmin` tem
permissão para criar bases, então as tabelas ficam em `pittapong` e não em `defaultdb`. Por
isso `DB_NAME=pittapong` nos dois ambientes, e um único script serve local e nuvem — o que
elimina o risco de divergência de schema.

O usuário administrador vem de `npm run seed`, não do dump: o dump traz o usuário `candido`
com senha em MD5, incompatível com a validação bcrypt da API.

## Variáveis de ambiente

| Variável | Local | Produção |
| --- | --- | --- |
| `PORT` | `3000` | injetada pelo Render |
| `DB_HOST` / `DB_PORT` | `localhost` / `3306` | host e porta do Aiven |
| `DB_USER` / `DB_PASSWORD` | credenciais locais | `avnadmin` e senha do Aiven |
| `DB_NAME` | `pittapong` | `pittapong` |
| `DB_SSL` | ausente | `true` |
| `DB_SSL_CA` | ausente | conteúdo do `ca.pem` do Aiven |
| `JWT_SECRET` | qualquer | segredo forte, distinto do local |
| `API_PUBLIC_URL` | ausente | URL pública do Render |
| `CORS_ORIGIN` | ausente | URL do front-end (pendente) |

Nenhum valor real está versionado; `.env` permanece no `.gitignore`.

## Verificação

Bateria executada contra o ambiente publicado, com todos os checks passando:

- **HTTPS e disponibilidade** — `GET /api/status` responde `200`.
- **Documentação** — `/api-docs` carrega com as 13 rotas documentadas, e o seletor de
  servidores traz a URL de produção em primeiro lugar.
- **Autenticação** — `/categorias`, `/produtos`, `/clientes` e `/pedidos` retornam `401`
  sem token; token adulterado também retorna `401`; após login em `/usuario/login` e
  autorização Bearer, retornam `200`.
- **Persistência** — criação de uma categoria, releitura confirmando o registro e remoção
  em seguida, contra a base do Aiven (6 categorias e 22 produtos carregados do dump).
- **CORS** — preflight `OPTIONS` responde `204`, liberando `GET,POST,PUT,DELETE,OPTIONS` e
  o cabeçalho `Authorization`.

A aplicação também foi iniciada fora da raiz do repositório e sem arquivo `.env`, apenas
com variáveis de ambiente — a mesma condição do Render —, confirmando conexão TLS com o
Aiven e as 13 rotas documentadas.

## Pendências

- **Front-end na Vercel.** A API já está preparada para consumo por navegador; falta o
  cliente web. Quando existir, basta definir `CORS_ORIGIN` com a URL da Vercel no painel do
  Render — enquanto a variável estiver ausente, a API aceita qualquer origem.
- **Suíte de testes automatizados.** O projeto não possui testes. O ponto de corte natural,
  caso venham a ser escritos, é a fronteira HTTP da aplicação Express.

## Notas de operação

- O plano Free do Render hiberna o serviço após inatividade; a primeira requisição depois
  disso pode levar dezenas de segundos. Vale aquecer o serviço antes de uma demonstração.
- A API falha no boot (`process.exit(1)`) se não conseguir conectar ao banco. No Render
  isso aparece como ciclo de restart nos logs — que é o sinal desejado quando o `DB_SSL_CA`
  está incorreto, em vez de uma API no ar respondendo `500` em toda rota.
- O modo de falha mais provável ao recolar credenciais é perder as quebras de linha do
  `ca.pem` na variável de ambiente, resultando em erro de handshake TLS.
