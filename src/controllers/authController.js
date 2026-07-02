const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Gera um token JWT contendo o id do usuario no payload.
const gerarToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });

// POST /usuario/cadastro - registrar novo usuario na base relacional
exports.register = async (req, res) => {
  try {
    const { nome, nick, senha } = req.body;

    if (!nome || !nick || !senha) {
      return res.status(400).json({ msg: 'Preencha todos os campos (nome, nick, senha)' });
    }

    const existe = await Usuario.buscarPorNick(nick);
    if (existe) {
      return res.status(409).json({ msg: 'Nick já cadastrado' });
    }

    const hash = await bcrypt.hash(senha, 10);
    const id = await Usuario.criar({ nome, nick, senha: hash });

    // Gera token JWT para auto-login apos cadastro
    const token = gerarToken(id);

    res.status(201).json({
      msg: 'Usuário cadastrado com sucesso',
      usuario: { id, nome, nick },
      token,
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// POST /usuario/login - autenticar usuario e retornar token
exports.login = async (req, res) => {
  try {
    const { nick, senha } = req.body;

    if (!nick || !senha) {
      return res.status(400).json({ msg: 'Preencha todos os campos (nick, senha)' });
    }

    const usuario = await Usuario.buscarPorNick(nick);
    if (!usuario) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ msg: 'Senha inválida' });
    }

    const token = gerarToken(usuario.id_usuario);

    res.json({
      msg: 'Login realizado com sucesso',
      usuario: {
        id: usuario.id_usuario,
        nome: usuario.nome,
        nick: usuario.nick,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// POST /usuario/logout - logout (simbolico em API stateless com JWT)
exports.logout = (req, res) => {
  res.json({ msg: 'Logout realizado com sucesso' });
};
