const express = require('express');
const router = express.Router();

// Versao atual da API (mantida em um unico lugar).
const VERSAO_API = '2.0.0';

/**
 * @swagger
 * /api/status:
 *   get:
 *     tags:
 *       - Status
 *     summary: Verifica o status e a versão da API (rota pública)
 *     description: >
 *       Endpoint público de monitoramento — **não requer autenticação**.
 *       Retorna a versão atual da API e o status de disponibilidade.
 *     responses:
 *       200:
 *         description: API online.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatusResponse'
 *             example:
 *               versao: "2.0.0"
 *               status: online
 */
router.get('/status', (req, res) => {
  res.json({ versao: VERSAO_API, status: 'online' });
});

/**
 * @swagger
 * /api/versao:
 *   get:
 *     tags:
 *       - Status
 *     summary: Retorna a versão da API (rota pública)
 *     description: >
 *       Alias de `/api/status`. Endpoint público que informa a versão atual da API.
 *     responses:
 *       200:
 *         description: Versão retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatusResponse'
 *             example:
 *               versao: "2.0.0"
 *               status: online
 */
router.get('/versao', (req, res) => {
  res.json({ versao: VERSAO_API, status: 'online' });
});

module.exports = router;
