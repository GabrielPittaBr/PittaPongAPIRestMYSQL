const Cliente = require('../models/clienteModel');

const STATUS_VALIDOS = ['bom', 'medio', 'ruim'];

// GET /clientes - listar todos os clientes
exports.listarClientes = async (req, res) => {
  try {
    const clientes = await Cliente.listarTodos();
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// GET /clientes/:id - obter um cliente pelo id
exports.obterCliente = async (req, res) => {
  try {
    const cliente = await Cliente.buscarPorId(req.params.id);
    if (!cliente) {
      return res.status(404).json({ msg: 'Cliente não encontrado' });
    }
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// POST /clientes - criar cliente
exports.criarCliente = async (req, res) => {
  try {
    const { nome, telefone } = req.body;
    const status = req.body.status || 'medio';

    if (!nome || !telefone) {
      return res.status(400).json({
        msg: 'Preencha os campos obrigatórios (nome, telefone)',
      });
    }

    if (!STATUS_VALIDOS.includes(status)) {
      return res.status(400).json({ msg: "status deve ser 'bom', 'medio' ou 'ruim'" });
    }

    const id = await Cliente.criar({ nome, telefone, status });

    res.status(201).json({
      msg: 'Cliente criado com sucesso',
      cliente: { id_cliente: id, nome, telefone, status },
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// PUT /clientes/:id - atualizar cliente
exports.atualizarCliente = async (req, res) => {
  try {
    const { nome, telefone } = req.body;

    if (!nome || !telefone) {
      return res.status(400).json({
        msg: 'Preencha os campos obrigatórios (nome, telefone)',
      });
    }

    const cliente = await Cliente.buscarPorId(req.params.id);
    if (!cliente) {
      return res.status(404).json({ msg: 'Cliente não encontrado' });
    }

    const status = req.body.status || cliente.status;
    if (!STATUS_VALIDOS.includes(status)) {
      return res.status(400).json({ msg: "status deve ser 'bom', 'medio' ou 'ruim'" });
    }

    await Cliente.atualizar(req.params.id, { nome, telefone, status });

    res.json({
      msg: 'Cliente atualizado com sucesso',
      cliente: { id_cliente: Number(req.params.id), nome, telefone, status },
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// DELETE /clientes/:id - deletar cliente
exports.deletarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.buscarPorId(req.params.id);
    if (!cliente) {
      return res.status(404).json({ msg: 'Cliente não encontrado' });
    }

    await Cliente.deletar(req.params.id);

    res.json({ msg: 'Cliente deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};
