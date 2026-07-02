const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuarioModel');

// Middleware de acesso estrito (requisito D).
// So libera a rota se houver:
//   1. Um token JWT valido; e
//   2. O id do usuario presente no payload do token (opcionalmente confirmado
//      pelo cabecalho x-user-id); e
//   3. Esse usuario realmente existente na tabela `usuarios`.
// Qualquer falha resulta em 401 (nao autenticado) ou 403 (proibido).
module.exports = async (req, res, next) => {
  // Tenta pegar o header Authorization primeiro, depois o cookie.
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ msg: 'Token não fornecido' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ msg: 'Token inválido' });
  }

  // O id do usuario precisa estar explicitamente informado no payload do token.
  if (!decoded || !decoded.id) {
    return res.status(401).json({ msg: 'Token sem identificação de usuário' });
  }

  // Se o cabecalho x-user-id for enviado, ele precisa bater com o id do token.
  const headerUserId = req.headers['x-user-id'];
  if (headerUserId && String(headerUserId) !== String(decoded.id)) {
    return res.status(403).json({ msg: 'Identificação de usuário divergente do token' });
  }

  try {
    // Valida que o usuario realmente existe na base relacional.
    const usuario = await Usuario.buscarPorId(decoded.id);
    if (!usuario) {
      return res.status(401).json({ msg: 'Usuário não encontrado ou token inválido' });
    }

    req.userId = usuario.id_usuario;
    next();
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
};
