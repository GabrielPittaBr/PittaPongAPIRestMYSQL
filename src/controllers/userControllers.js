const Usuario = require('../models/userModels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ msg: 'Email já cadastrado' });

    const hash = await bcrypt.hash(senha, 10);

    const usuario = new Usuario({
      nome,
      email,
      senha: hash
    });

    await usuario.save();

    res.status(201).json({ msg: 'Usuário criado' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(400).json({ msg: 'Usuário não encontrado' });

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) return res.status(400).json({ msg: 'Senha inválida' });

    const token = jwt.sign(
      { id: usuario._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};