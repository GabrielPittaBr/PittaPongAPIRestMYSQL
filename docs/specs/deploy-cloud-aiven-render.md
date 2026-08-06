# Spec: Deploy da API em nuvem (Aiven MySQL + Render)

**Branch:** `feature/deploy-cloud`
**Status:** ready-for-agent

## Problem Statement

A API REST do PittaPong hoje só roda na máquina do desenvolvedor. Ela assume um MySQL em
`localhost:3306` sem TLS, publica a documentação Swagger apontando para
`http://localhost:3000`, e não tem nenhuma política de CORS — qualquer origem pode chamar
qualquer rota, ou nenhuma consegue, dependendo do navegador.

A entrega exige uma arquitetura desacoplada em três camadas hospedadas publicamente:
persistência em nuvem (Aiven), API REST em nuvem (Render) e front-end em nuvem (Vercel)
consumindo a API por HTTPS. Nada disso é possível com a configuração atual: o pool MySQL
não negocia SSL (o Aiven recusa a conexão), o Swagger UI publicado tentaria testar
endpoints em `localhost` (falhando para qualquer avaliador), e o navegador bloquearia as
requisições do front-end por ausência de cabeçalhos CORS.

Além disso, o script `database/pittapong.sql` executa `CREATE DATABASE pittapong` e
`USE pittapong`, incompatível com a base `defaultdb` já provisionada no Aiven.

## Solution

Tornar a API deployável em nuvem sem alterar nenhum comportamento de negócio: os mesmos
endpoints, os mesmos contratos JSON, a mesma autenticação JWT. Toda a diferença entre
rodar local e rodar em produção passa a ser expressa por variáveis de ambiente.

Do ponto de vista de quem usa o sistema:

- O avaliador abre uma URL pública `https://<app>.onrender.com/api-docs`, clica em
  **Try it out** em qualquer endpoint, e a requisição sai contra a própria API pública —
  não contra `localhost`.
- O avaliador faz login em `/usuario/login` pelo Swagger, cola o token no botão
  **Authorize**, e passa a conseguir executar o CRUD de categorias, produtos, clientes e
  pedidos. Sem o token, recebe `401`.
- Os dados que ele criar persistem na instância MySQL do Aiven, sobrevivendo a restarts do
  serviço no Render.
- Um front-end hospedado na Vercel consegue chamar a API pelo navegador; qualquer outra
  origem é rejeitada pela política de CORS.
- O desenvolvedor continua rodando `npm start` localmente contra o MySQL da sua máquina,
  sem SSL, sem mudar uma linha de código — apenas o `.env` difere.

## User Stories

### Persistência em nuvem (Aiven)

1. Como desenvolvedor, quero que o pool de conexões MySQL aceite configuração de TLS por variável de ambiente, para que a mesma base de código conecte tanto ao MySQL local sem SSL quanto ao Aiven com SSL obrigatório.
2. Como desenvolvedor, quero fornecer o certificado CA do Aiven por variável de ambiente, para que a validação do certificado do servidor seja real e eu não precise commitar o `ca.pem` no repositório.
3. Como desenvolvedor, quero que a ausência da variável de SSL mantenha o comportamento atual (conexão sem TLS), para que meu ambiente local não quebre com essa mudança.
4. Como desenvolvedor, quero um script SQL que funcione numa base já existente e pré-nomeada, para que eu consiga carregar o schema no `defaultdb` do Aiven, onde não posso escolher o nome da base.
5. Como desenvolvedor, quero que o schema em nuvem preserve as mesmas tabelas, chaves estrangeiras e dados de exemplo do script local, para que o comportamento da API seja idêntico nos dois ambientes.
6. Como desenvolvedor, quero rodar o seed de usuário administrador contra a base em nuvem, para que exista uma credencial com hash bcrypt válida para o login no ambiente publicado.
7. Como desenvolvedor, quero que a API falhe rápido e com mensagem clara quando não conseguir conectar ao banco em nuvem, para que eu diagnostique o problema pelos logs do Render em vez de ver requisições pendurando.
8. Como avaliador, quero que os dados que eu criar pelo Swagger continuem existindo depois de o serviço hibernar e acordar, para que eu confirme que a persistência é realmente externa à aplicação.

### API REST em nuvem (Render)

9. Como desenvolvedor, quero que a aplicação escute na porta definida pela variável `PORT` do ambiente, para que o Render consiga rotear tráfego para o processo.
10. Como desenvolvedor, quero que a aplicação escute em todas as interfaces de rede, para que o roteador do Render alcance o processo de fora do container.
11. Como desenvolvedor, quero declarar a versão do Node.js exigida pelo projeto, para que o Render não escolha uma versão incompatível com as dependências nativas (`bcrypt`).
12. Como desenvolvedor, quero um arquivo de exemplo de ambiente que documente todas as variáveis necessárias em produção, para que eu preencha o painel do Render sem esquecer nenhuma.
13. Como desenvolvedor, quero que segredos (senha do banco, `JWT_SECRET`, certificado CA) nunca sejam commitados, para que o repositório público não exponha credenciais.
14. Como desenvolvedor, quero um `JWT_SECRET` distinto entre local e produção, para que um token emitido em desenvolvimento não seja aceito no ambiente publicado.
15. Como avaliador, quero acessar a raiz `/` da API pública e ver o inventário de endpoints, para que eu entenda rapidamente a superfície da API.
16. Como avaliador, quero que o link de documentação anunciado na raiz aponte para a URL pública, para que eu chegue no Swagger sem editar a URL manualmente.
17. Como operador, quero uma rota pública de status que não toque o banco, para que um health check externo confirme que o processo está de pé.

### Documentação (Swagger UI)

18. Como avaliador, quero abrir `/api-docs` na URL pública e ver a documentação interativa completa, para que eu valide os endpoints sem instalar nada.
19. Como avaliador, quero que o seletor de servidor do Swagger inclua a URL pública da API, para que **Try it out** dispare requisições reais contra o ambiente publicado.
20. Como desenvolvedor, quero que o servidor local continue listado no Swagger, para que eu use a mesma documentação durante o desenvolvimento.
21. Como desenvolvedor, quero que a URL pública do Swagger venha de variável de ambiente, para que trocar de host de deploy não exija alterar código.
22. Como avaliador, quero autenticar no Swagger pelo botão **Authorize** com um token Bearer, para que eu exercite as rotas privadas na interface.
23. Como avaliador, quero que o Swagger mantenha minha autorização entre chamadas, para que eu não precise recolar o token a cada endpoint testado.
24. Como avaliador, quero que a documentação descreva os códigos de erro `401`, `403`, `404` e `409` de cada rota, para que eu entenda as respostas negativas sem ler o código-fonte.

### Segurança: CORS e HTTPS

25. Como desenvolvedor, quero uma política de CORS explícita na API, para que o navegador libere as requisições do front-end hospedado.
26. Como desenvolvedor, quero que as origens permitidas sejam definidas por variável de ambiente, para que eu autorize a URL da Vercel sem alterar código.
27. Como desenvolvedor, quero que uma requisição vinda de origem não autorizada seja rejeitada, para que a API não fique aberta a qualquer site.
28. Como desenvolvedor, quero permitir mais de uma origem via lista separada por vírgula, para que a URL de preview da Vercel e a de produção convivam.
29. Como desenvolvedor, quero que o cabeçalho `Authorization` esteja entre os cabeçalhos permitidos pelo CORS, para que o front-end consiga enviar o token JWT.
30. Como desenvolvedor, quero que os métodos `GET`, `POST`, `PUT`, `DELETE` e `OPTIONS` sejam permitidos, para que o CRUD completo funcione a partir do navegador.
31. Como desenvolvedor, quero que a requisição de preflight `OPTIONS` seja respondida corretamente, para que o navegador libere `PUT` e `DELETE` com cabeçalho customizado.
32. Como desenvolvedor, quero que requisições sem cabeçalho `Origin` continuem funcionando, para que Swagger UI, Postman, `curl` e health checks não sejam bloqueados.
33. Como avaliador, quero que todo o tráfego com a API use HTTPS, para que credenciais e tokens não trafeguem em claro.
34. Como avaliador, quero que as rotas de categorias, produtos, clientes e pedidos exijam token JWT válido, para que eu confirme que os dados não estão publicamente graváveis.
35. Como avaliador, quero que um token expirado ou adulterado seja rejeitado com `401`, para que eu confirme que a assinatura é verificada.
36. Como avaliador, quero que um token cujo usuário não existe mais na base seja rejeitado, para que eu confirme que a autorização consulta a fonte de verdade.

### Operação do deploy

37. Como desenvolvedor, quero um passo a passo documentado do deploy, para que eu reproduza o ambiente do zero se o serviço for recriado.
38. Como desenvolvedor, quero saber exatamente quais variáveis configurar no painel do Render, para que o primeiro boot não falhe por configuração faltante.
39. Como desenvolvedor, quero saber como carregar o schema no Aiven, para que a base em nuvem esteja pronta antes do primeiro boot da API.
40. Como desenvolvedor, quero verificar o deploy por uma sequência de checagens objetivas, para que eu saiba se a entrega está completa antes de submeter os links.
41. Como desenvolvedor, quero que o README aponte as URLs públicas da API e da documentação, para que quem abrir o repositório chegue no ambiente publicado.

## Implementation Decisions

### Configuração do banco (`src/config/database`)

- O módulo de conexão passa a montar a opção `ssl` do pool `mysql2` a partir do ambiente,
  mantendo a interface pública atual: exporta o `pool` e `testarConexao()`. Nenhum model
  ou controller muda.
- Duas variáveis novas governam TLS:
  - `DB_SSL` — quando ativa, habilita TLS na conexão.
  - `DB_SSL_CA` — conteúdo PEM do certificado CA do Aiven, usado com validação de
    certificado ligada (`rejectUnauthorized: true`).
- Sem `DB_SSL`, a opção `ssl` fica ausente do pool e o comportamento local permanece
  literalmente o de hoje. Essa é a garantia de que a mudança é aditiva.
- O certificado é passado por variável de ambiente, não por arquivo no repositório. O PEM
  é multilinha; o painel do Render aceita valores multilinha em variáveis de ambiente,
  então o valor é colado tal como baixado do console Aiven.
- `connectionLimit` permanece em 10. O plano gratuito do Aiven tem limite de conexões
  simultâneas; se ele se mostrar apertado no ambiente publicado, o ajuste é reduzir esse
  número — não uma mudança de arquitetura.

### Schema em nuvem (`database/`)

- **Nenhum script novo é necessário.** A premissa inicial — de que o `defaultdb` do Aiven
  obrigaria uma variante sem `CREATE DATABASE`/`USE` — foi verificada contra a instância
  real e está errada: o usuário `avnadmin` tem permissão de criar bases. O
  `database/pittapong.sql` existente roda sem alteração no Aiven e cria a base
  `pittapong` com as 7 tabelas e os dados de exemplo.
- Consequência direta: **`DB_NAME=pittapong` também em produção**, idêntico ao local.
  `defaultdb` permanece vazia e não é usada. O comando de carga aponta para `defaultdb`
  apenas porque o cliente MySQL precisa de uma base inicial para conectar; o `USE` dentro
  do script redireciona para `pittapong`.
- Um único script serve os dois ambientes, o que elimina o risco de divergência de schema
  entre local e nuvem.
- O usuário administrador continua vindo de `npm run seed`, não do dump — o dump traz o
  usuário `candido` com senha MD5, incompatível com a validação bcrypt do
  `authController`. O seed é executado uma vez contra o Aiven, a partir da máquina local,
  com o `.env` apontando para a nuvem.

### CORS (`src/app`)

- A dependência `cors` é adicionada ao projeto. Não há motivo para escrever middleware
  próprio: a especificação de preflight tem casos de borda suficientes para justificar a
  biblioteca padrão do ecossistema Express.
- A variável `CORS_ORIGIN` define as origens permitidas como lista separada por vírgula.
  Origens são comparadas exatamente (protocolo + host + porta), sem coringas.
- Requisições **sem** cabeçalho `Origin` são permitidas. Isso não é um furo: são
  requisições não originadas de navegador (Swagger UI, `curl`, Postman, health checks),
  onde a política de mesma origem não se aplica de todo modo. Bloqueá-las quebraria o
  próprio `/api-docs`.
- Quando `CORS_ORIGIN` não está definida, a API permite qualquer origem. É o modo de
  desenvolvimento; produção sempre define a variável. Essa escolha evita que o ambiente
  local exija configuração extra.
- Cabeçalhos permitidos incluem `Content-Type` e `Authorization` — sem o segundo, o
  front-end não consegue enviar o Bearer token. Métodos permitidos: `GET`, `POST`, `PUT`,
  `DELETE`, `OPTIONS`.
- O middleware de CORS é registrado antes das rotas e antes do Swagger UI.

### Swagger (`src/config/swagger`)

- A lista `servers` passa a ser construída dinamicamente. Quando `API_PUBLIC_URL` está
  definida, essa URL entra como primeiro item (o Swagger UI seleciona o primeiro por
  padrão, então **Try it out** aponta para produção); o servidor local permanece como
  segundo item.
- Sem `API_PUBLIC_URL`, apenas o servidor local é listado — o comportamento de hoje.
- Nenhuma anotação `@swagger` das rotas muda. A cobertura de schemas e códigos de resposta
  já existente é considerada suficiente para o critério de documentação.
- O caminho dos arquivos anotados em `apis` é relativo ao diretório de trabalho do
  processo. O comando de start no Render deve ser executado a partir da raiz do
  repositório, ou o Swagger sobe sem nenhum endpoint documentado. Este é o modo de falha
  mais provável e silencioso do deploy — verificar explicitamente.

### Boot e ambiente (`src/app`, `package.json`)

- A porta continua vindo de `PORT` com fallback `3000`. O Render injeta `PORT`; nada muda.
- `app.listen` passa a escutar explicitamente em `0.0.0.0`. O padrão do Node já é esse,
  mas torná-lo explícito remove uma classe inteira de dúvida em diagnóstico de deploy.
- A mensagem de boot deixa de anunciar `http://localhost:<porta>` como URL de documentação
  quando `API_PUBLIC_URL` está definida. Mesma correção na resposta da rota `/`, cujo campo
  `documentacao` hoje é `http://localhost:3000/api-docs` fixo — o que, na URL pública,
  entrega ao avaliador um link quebrado.
- `package.json` ganha um campo `engines` fixando a major do Node. `bcrypt` é um módulo
  nativo; deixar o provedor escolher a versão é a causa clássica de falha de build.
- O comando de start permanece `npm start` → `node src/app.js`. Nenhum build step.
- O campo `repository` do `package.json` aponta para `PittaPong2.0`, que não é este
  repositório. Corrigir junto, para que os links de repositório da entrega batam.

### Variáveis de ambiente

O `.env_exemplo` passa a documentar o conjunto completo:

| Variável | Local | Produção (Render) |
| --- | --- | --- |
| `PORT` | `3000` | injetada pelo Render |
| `DB_HOST` | `localhost` | host do serviço Aiven |
| `DB_PORT` | `3306` | porta do serviço Aiven |
| `DB_USER` | `root` | `avnadmin` |
| `DB_PASSWORD` | senha local | senha do Aiven |
| `DB_NAME` | `pittapong` | `pittapong` |
| `DB_SSL` | ausente | ativa |
| `DB_SSL_CA` | ausente | conteúdo do `ca.pem` do Aiven |
| `JWT_SECRET` | qualquer | segredo forte, distinto do local |
| `CORS_ORIGIN` | ausente | URL da Vercel |
| `API_PUBLIC_URL` | ausente | URL pública do Render |

Nenhum valor real entra no repositório. `.env` já está no `.gitignore`.

### Sequência de deploy

1. Carregar `database/pittapong.sql` no Aiven via cliente MySQL com
   `--ssl-mode=REQUIRED`, conectando em `defaultdb`. O script cria a base `pittapong`.
2. Executar `npm run seed` localmente com o `.env` apontando para o Aiven, criando o
   usuário administrador com hash bcrypt.
3. Publicar a branch no GitHub.
4. Criar o Web Service no Render a partir do repositório: build `npm install`, start
   `npm start`, raiz do repositório como diretório de trabalho.
5. Preencher as variáveis de ambiente no painel do Render. `API_PUBLIC_URL` só é conhecida
   após o primeiro deploy — configurá-la e redeployar.
6. `CORS_ORIGIN` recebe a URL da Vercel quando o front-end existir. Até lá, pode ficar
   ausente (CORS permissivo) ou receber um placeholder.

## Testing Decisions

O projeto não possui suíte de testes (`npm test` retorna erro por design) nem
infraestrutura de teste. Esta spec **não** introduz uma — fazê-lo seria expandir o escopo
para além de um deploy.

### Seam

Se testes automatizados forem adicionados depois, o seam correto é único e já está
identificado: **a fronteira HTTP da aplicação Express**. Hoje `src/app.js` constrói o app e
chama `listen()` no mesmo módulo, o que impede importar o app sem subir um servidor e
conectar ao banco. Separar a construção do app da sua inicialização — o módulo exporta o
app configurado, e um ponto de entrada distinto o coloca no ar — cria esse seam sem
adicionar nenhum outro. Todo o comportamento desta spec (CORS, JWT, contratos JSON) é
observável através dele com um cliente HTTP.

Um teste bom nesse seam envia uma requisição e verifica status, cabeçalhos e corpo da
resposta. Não inspeciona qual middleware rodou, nem como o pool foi configurado — trocar
`cors` por outra implementação não deve quebrar nenhum teste.

Essa separação **não** faz parte desta entrega. Fica registrada para o momento em que
testes forem escritos.

### Validação desta entrega

A verificação é manual e roteirizada, na URL pública, seguindo o modelo do
`ROTEIRO-DEMO.md` já existente no repositório:

- **Conectividade**: `GET /api/status` responde `200` e o log do Render registra conexão
  MySQL bem-sucedida.
- **Persistência**: um `POST /categorias` seguido de `GET /categorias` em outra sessão
  retorna o registro; o dado sobrevive a um restart manual do serviço.
- **Swagger**: `/api-docs` carrega com todos os grupos de tags visíveis (grupos ausentes
  indicam o problema de diretório de trabalho descrito acima), e o seletor de servidor
  mostra a URL pública em primeiro lugar.
- **Autenticação**: `GET /categorias` sem `Authorization` retorna `401`; com token válido
  obtido em `/usuario/login`, retorna `200`. Token adulterado retorna `401`.
- **CORS**: com `CORS_ORIGIN` definida, uma requisição com `Origin` autorizada recebe
  `Access-Control-Allow-Origin` na resposta; com `Origin` não autorizada, não recebe. Um
  preflight `OPTIONS` para `DELETE` é respondido com sucesso.
- **HTTPS**: a URL pública responde em `https://` (o Render provê TLS por padrão).

## Out of Scope

- **Front-end na Vercel.** Decidido explicitamente pelo desenvolvedor como fora do escopo
  desta spec. A API é preparada para consumo por navegador — CORS configurável por
  ambiente, JSON em todas as rotas, JWT Bearer — mas nenhum cliente web é construído aqui.
  O requisito de "comunicação decoupled end-to-end" da entrega permanece pendente até que
  o front-end exista.
- **Rotação da senha do Aiven.** Decidido pelo desenvolvedor como desnecessário no
  contexto acadêmico. A credencial atual permanece; a única exigência mantida é que ela
  nunca seja commitada.
- **Suíte de testes automatizados** e a refatoração do seam HTTP que a habilitaria.
- **CI/CD além do auto-deploy nativo do Render** ao push na branch.
- **Migrations versionadas.** O schema continua sendo carregado por script SQL manual.
- **Rate limiting, Helmet, logging estruturado, observabilidade.** Endurecimento além do
  exigido pelos critérios de validação.
- **Refresh tokens ou revogação de JWT.** O logout permanece simbólico, com expiração de
  1 dia como hoje.
- **Mudanças nos contratos de qualquer endpoint existente.** Nenhuma rota, campo de
  request ou formato de response muda nesta spec.
- **Domínio customizado** para API ou documentação.

## Further Notes

- **Hibernação no plano gratuito do Render**: o serviço dorme após inatividade e a
  primeira requisição depois disso leva dezenas de segundos. Não é defeito. Vale avisar
  quem for avaliar, ou aquecer o serviço antes da demonstração.
- **Falha de boot é fatal por design**: `src/app.js` chama `process.exit(1)` se a conexão
  MySQL falhar no boot. No Render isso vira um ciclo de restart visível nos logs — que é o
  sinal desejado quando o `DB_SSL_CA` está errado, e não uma API no ar respondendo `500`
  em toda rota.
- **O modo de falha do Swagger subir sem endpoints foi eliminado na origem**: os caminhos
  em `apis` passaram a ser resolvidos a partir do próprio módulo, e não do diretório de
  trabalho do processo. Verificado iniciando a aplicação de fora da raiz do repositório —
  as 13 rotas continuam documentadas.
- **Segundo modo de falha mais provável**: quebra de linha perdida ao colar o `ca.pem` na
  variável de ambiente do Render, resultando em erro de handshake TLS. O PEM precisa
  chegar íntegro, com as linhas `-----BEGIN CERTIFICATE-----` e
  `-----END CERTIFICATE-----`.
- O `authMiddleware` aceita token via cookie (`req.cookies.token`), mas nenhum middleware
  de parsing de cookie está registrado no app — esse ramo é código morto hoje. Não é
  problema para o deploy (o caminho `Authorization` funciona), apenas vale saber que a
  leitura por cookie não está ativa.
- A API é stateless: todo o estado vive no Aiven. Escalar horizontalmente no Render não
  exigiria mudança de código.
