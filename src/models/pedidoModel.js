const pool = require('../config/database');

// Model das tabelas `pedidos` e `produtos_pedidos` (itens do pedido).
// Todas as queries usam prepared statements (?). As operacoes que envolvem
// varias tabelas usam transacao para garantir a integridade.

// Lista os pedidos com o nome do cliente (JOIN).
exports.listarTodos = async () => {
  const [linhas] = await pool.execute(
    'SELECT p.id_pedido, p.data, p.clientes_id_cliente, c.nome AS cliente_nome ' +
      'FROM pedidos p ' +
      'JOIN clientes c ON p.clientes_id_cliente = c.id_cliente ' +
      'ORDER BY p.id_pedido DESC'
  );
  return linhas;
};

// Busca um pedido pelo id, incluindo seus itens (produtos_pedidos).
exports.buscarPorId = async (id) => {
  const [pedidos] = await pool.execute(
    'SELECT p.id_pedido, p.data, p.clientes_id_cliente, c.nome AS cliente_nome ' +
      'FROM pedidos p ' +
      'JOIN clientes c ON p.clientes_id_cliente = c.id_cliente ' +
      'WHERE p.id_pedido = ?',
    [id]
  );

  const pedido = pedidos[0];
  if (!pedido) return null;

  const [itens] = await pool.execute(
    'SELECT pp.produtos_id_produto, pr.nome AS produto_nome, pp.quantidade, pp.valor ' +
      'FROM produtos_pedidos pp ' +
      'JOIN produtos pr ON pp.produtos_id_produto = pr.id_produto ' +
      'WHERE pp.pedidos_id_pedido = ?',
    [id]
  );

  pedido.itens = itens;
  return pedido;
};

// Cria um pedido e seus itens dentro de uma transacao.
exports.criar = async ({ data, clientes_id_cliente, itens }) => {
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();

    const [resultado] = await conexao.execute(
      'INSERT INTO pedidos (data, clientes_id_cliente) VALUES (?, ?)',
      [data, clientes_id_cliente]
    );
    const idPedido = resultado.insertId;

    for (const item of itens) {
      await conexao.execute(
        'INSERT INTO produtos_pedidos (produtos_id_produto, pedidos_id_pedido, quantidade, valor) VALUES (?, ?, ?, ?)',
        [item.produtos_id_produto, idPedido, item.quantidade, item.valor]
      );
    }

    await conexao.commit();
    return idPedido;
  } catch (err) {
    await conexao.rollback();
    throw err;
  } finally {
    conexao.release();
  }
};

// Atualiza o cabecalho do pedido e, se `itens` for informado, substitui todos os itens.
exports.atualizar = async (id, { data, clientes_id_cliente, itens }) => {
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();

    const [resultado] = await conexao.execute(
      'UPDATE pedidos SET data = ?, clientes_id_cliente = ? WHERE id_pedido = ?',
      [data, clientes_id_cliente, id]
    );

    if (Array.isArray(itens)) {
      await conexao.execute(
        'DELETE FROM produtos_pedidos WHERE pedidos_id_pedido = ?',
        [id]
      );
      for (const item of itens) {
        await conexao.execute(
          'INSERT INTO produtos_pedidos (produtos_id_produto, pedidos_id_pedido, quantidade, valor) VALUES (?, ?, ?, ?)',
          [item.produtos_id_produto, id, item.quantidade, item.valor]
        );
      }
    }

    await conexao.commit();
    return resultado.affectedRows;
  } catch (err) {
    await conexao.rollback();
    throw err;
  } finally {
    conexao.release();
  }
};

// Deleta um pedido e seus itens dentro de uma transacao.
exports.deletar = async (id) => {
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();

    await conexao.execute(
      'DELETE FROM produtos_pedidos WHERE pedidos_id_pedido = ?',
      [id]
    );
    const [resultado] = await conexao.execute(
      'DELETE FROM pedidos WHERE id_pedido = ?',
      [id]
    );

    await conexao.commit();
    return resultado.affectedRows;
  } catch (err) {
    await conexao.rollback();
    throw err;
  } finally {
    conexao.release();
  }
};
