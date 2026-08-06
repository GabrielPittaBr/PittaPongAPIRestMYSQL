// Politica de CORS da API.
//
// CORS_ORIGIN aceita uma lista de origens separadas por virgula, comparadas de forma
// exata (protocolo + host + porta). Em producao ela recebe a URL do front-end.
// Quando a variavel nao esta definida (ambiente local), qualquer origem e liberada.
//
// Requisicoes sem cabecalho Origin sao sempre permitidas: sao chamadas que nao partem
// de um navegador (Swagger UI, curl, Postman, health checks), onde a politica de mesma
// origem nao se aplica. Bloquea-las quebraria o proprio /api-docs.
const origensPermitidas = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origem) => origem.trim())
  .filter(Boolean);

const opcoesCors = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origensPermitidas.length === 0) return callback(null, true);
    return callback(null, origensPermitidas.includes(origin));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  optionsSuccessStatus: 204,
};

module.exports = opcoesCors;
module.exports.origensPermitidas = origensPermitidas;
