const Pedido = require('../models/pedidoModel');
const Cliente = require('../models/clienteModel');
const Produto = require('../models/produtoModel');

// Valida e prepara a lista de itens. O cliente informa apenas o produto e a
// quantidade; o preco unitario (valor) e buscado do proprio produto no banco.
// Retorna { ok, msg } em caso de erro, ou { ok: true, itens } com os itens
// enriquecidos com o valor unitario.
const prepararItens = async (itens) => {
  if (!Array.isArray(itens) || itens.length === 0) {
    return { ok: false, msg: 'Informe ao menos um item em "itens"' };
  }

  const preparados = [];
  const idsVistos = new Set();

  for (const item of itens) {
    const { produtos_id_produto, quantidade } = item;

    if (!produtos_id_produto || quantidade === undefined) {
      return {
        ok: false,
        msg: 'Cada item precisa de produtos_id_produto e quantidade',
      };
    }
    if (Number(quantidade) <= 0) {
      return { ok: false, msg: 'A quantidade de cada item deve ser maior que zero' };
    }
    if (idsVistos.has(String(produtos_id_produto))) {
      return { ok: false, msg: `Produto ${produtos_id_produto} repetido nos itens` };
    }
    idsVistos.add(String(produtos_id_produto));

    const produto = await Produto.buscarPorId(produtos_id_produto);
    if (!produto) {
      return { ok: false, msg: `Produto ${produtos_id_produto} não existe` };
    }

    // O preco unitario e sempre o valor atual do produto (calculado no servidor).
    preparados.push({ produtos_id_produto, quantidade, valor: produto.valor });
  }

  return { ok: true, itens: preparados };
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

    const preparacao = await prepararItens(itens);
    if (!preparacao.ok) {
      return res.status(400).json({ msg: preparacao.msg });
    }

    const id = await Pedido.criar({ data, clientes_id_cliente, itens: preparacao.itens });
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

    // itens e opcional no update; se enviado, precisa ser valido e tem o preco
    // unitario calculado a partir dos produtos.
    let itensPreparados = itens;
    if (itens !== undefined) {
      const preparacao = await prepararItens(itens);
      if (!preparacao.ok) {
        return res.status(400).json({ msg: preparacao.msg });
      }
      itensPreparados = preparacao.itens;
    }

    await Pedido.atualizar(req.params.id, { data, clientes_id_cliente, itens: itensPreparados });
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
