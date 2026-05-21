const Usuario = require('../models/userModels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// POST /usuario/cadastro - registrar novo usuário
exports.register = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ msg: 'Preencha todos os campos (nome, email, senha)' });
    }

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(409).json({ msg: 'Email já cadastrado' });
    }

    const hash = await bcrypt.hash(senha, 10);

    const usuario = new Usuario({
      nome,
      email,
      senha: hash
    });

    await usuario.save();

    // Gerar token JWT para auto-login após cadastro
    const token = jwt.sign(
      { id: usuario._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      msg: 'Usuário cadastrado com sucesso',
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email
      },
      token
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// POST /usuario/login - autenticar usuário e retornar token
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ msg: 'Preencha todos os campos (email, senha)' });
    }

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ msg: 'Senha inválida' });
    }

    const token = jwt.sign(
      { id: usuario._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      msg: 'Login realizado com sucesso',
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email
      },
      token
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// POST /usuario/logout - logout (simbólico em API stateless)
exports.logout = (req, res) => {
  res.json({ msg: 'Logout realizado com sucesso' });
};