const Pedido = require('../models/pedidoModel');
const Cliente = require('../models/clienteModel');
const Produto = require('../models/produtoModel');

// Valida a lista de itens: precisa ser um array nao vazio, com campos numericos,
// e cada produto referenciado precisa existir. Retorna { ok, msg }.
const validarItens = async (itens) => {
  if (!Array.isArray(itens) || itens.length === 0) {
    return { ok: false, msg: 'Informe ao menos um item em "itens"' };
  }

  for (const item of itens) {
    const { produtos_id_produto, quantidade, valor } = item;
    if (!produtos_id_produto || quantidade === undefined || valor === undefined) {
      return {
        ok: false,
        msg: 'Cada item precisa de produtos_id_produto, quantidade e valor',
      };
    }
    const produto = await Produto.buscarPorId(produtos_id_produto);
    if (!produto) {
      return { ok: false, msg: `Produto ${produtos_id_produto} não existe` };
    }
  }

  return { ok: true };
};

// GET /pedidos - listar todos os pedidos
exports.listarPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.listarTodos();
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// GET /pedidos/:id - obter um pedido (com seus itens) pelo id
exports.obterPedido = async (req, res) => {
  try {
    const pedido = await Pedido.buscarPorId(req.params.id);
    if (!pedido) {
      return res.status(404).json({ msg: 'Pedido não encontrado' });
    }
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// POST /pedidos - criar pedido com itens (transacao)
exports.criarPedido = async (req, res) => {
  try {
    const { clientes_id_cliente, itens } = req.body;
    const data = req.body.data || new Date().toISOString().slice(0, 10);

    if (!clientes_id_cliente) {
      return res.status(400).json({ msg: 'O campo clientes_id_cliente é obrigatório' });
    }

    const cliente = await Cliente.buscarPorId(clientes_id_cliente);
    if (!cliente) {
      return res.status(400).json({ msg: 'Cliente informado não existe' });
    }

    const validacao = await validarItens(itens);
    if (!validacao.ok) {
      return res.status(400).json({ msg: validacao.msg });
    }

    const id = await Pedido.criar({ data, clientes_id_cliente, itens });
    const pedido = await Pedido.buscarPorId(id);

    res.status(201).json({ msg: 'Pedido criado com sucesso', pedido });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// PUT /pedidos/:id - atualizar pedido (cabecalho e, opcionalmente, itens)
exports.atualizarPedido = async (req, res) => {
  try {
    const { clientes_id_cliente, itens } = req.body;

    if (!clientes_id_cliente) {
      return res.status(400).json({ msg: 'O campo clientes_id_cliente é obrigatório' });
    }

    const pedido = await Pedido.buscarPorId(req.params.id);
    if (!pedido) {
      return res.status(404).json({ msg: 'Pedido não encontrado' });
    }

    const cliente = await Cliente.buscarPorId(clientes_id_cliente);
    if (!cliente) {
      return res.status(400).json({ msg: 'Cliente informado não existe' });
    }

    const data = req.body.data || pedido.data;

    // itens e opcional no update; se enviado, precisa ser valido.
    if (itens !== undefined) {
      const validacao = await validarItens(itens);
      if (!validacao.ok) {
        return res.status(400).json({ msg: validacao.msg });
      }
    }

    await Pedido.atualizar(req.params.id, { data, clientes_id_cliente, itens });
    const atualizado = await Pedido.buscarPorId(req.params.id);

    res.json({ msg: 'Pedido atualizado com sucesso', pedido: atualizado });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// DELETE /pedidos/:id - deletar pedido (e seus itens)
exports.deletarPedido = async (req, res) => {
  try {
    const pedido = await Pedido.buscarPorId(req.params.id);
    if (!pedido) {
      return res.status(404).json({ msg: 'Pedido não encontrado' });
    }

    await Pedido.deletar(req.params.id);

    res.json({ msg: 'Pedido deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};
