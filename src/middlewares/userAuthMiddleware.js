const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Try Authorization header first, then cookie
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token)
    return res.status(401).json({ msg: 'Token não fornecido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ msg: 'Token inválido' });
  }
};