// SIGECON Backend Unificado - Express + Neon/Postgres
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const Decimal = require('decimal.js');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do banco Neon/Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_8cDPnmrpoJ4B@ep-crimson-mode-aejyyt5m-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false, require: true }
});

// ================== Utilidade Moeda BRL ==================
function unformatBRL(val) {
  if (val instanceof Decimal) return val;
  if (typeof val === "number") return new Decimal(val);
  if (!val) return new Decimal(0);
  let clean = String(val).replace(/[^0-9.,]/g, '').replace(/^0+/, "");
  if (!clean) return new Decimal(0);
  let parts = clean.split(',');
  if (parts.length === 1) {
    let number = parts[0].replace(/\./g, '');
    return new Decimal(number).div(100);
  } else {
    let number = parts.slice(0, -1).join('').replace(/\./g, '') + '.' + parts.slice(-1);
    return new Decimal(number);
  }
}
function formatBRL(value) {
  let n = value instanceof Decimal ? value : new Decimal(value || 0);
  let parts = n.toFixed(2).split('.');
  let inteiro = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  let decimal = parts[1];
  return "R$ " + inteiro + ',' + decimal;
}

// ================== UG (Unidade Gestora) ==================

// Criar UG
app.post('/api/ug', async (req, res) => {
  const { nome } = req.body;
  try {
    const { rows } = await pool.query('INSERT INTO unidade_gestora (nome) VALUES ($1) RETURNING *', [nome]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar UGs
app.get('/api/ugs', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM unidade_gestora ORDER BY nome ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Editar UG
app.put('/api/ug/:id', async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  try {
    const { rows } = await pool.query('UPDATE unidade_gestora SET nome = $1 WHERE id = $2 RETURNING *', [nome, id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Excluir UG
app.delete('/api/ug/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Verifica se NC usa a UG
    const { rowCount } = await pool.query('SELECT 1 FROM nota_credito WHERE ug_id = $1', [id]);
    if (rowCount) return res.status(409).json({ error: 'UG em uso em NCs.' });
    await pool.query('DELETE FROM unidade_gestora WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== Nota de Crédito (NC) ==================

// Criar NC
app.post('/api/nc', async (req, res) => {
  const { ug_id, numero, data_emissao, descricao, prazo, nd, esfera, ptres, fonte, pi, responsavel, valor } = req.body;
  const query = `
    INSERT INTO nota_credito (
      ug_id, numero, data_emissao, descricao, prazo, nd, esfera, ptres, fonte, pi, responsavel, valor, dataInclusao
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW()
    ) RETURNING *
  `;
  const values = [ug_id, numero, data_emissao, descricao, prazo, nd, esfera, ptres, fonte, pi, responsavel, valor];
  try {
    const { rows } = await pool.query(query, values);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar todas NCs (com saldo_atual, subncs e nes agregados)
app.get('/api/ncs', async (req, res) => {
  const query = `
    SELECT 
      nc.*,
      COALESCE(
        (SELECT json_agg(subnc) FROM subnc WHERE subnc.nc_id = nc.id ORDER BY data DESC),
        '[]'
      ) AS subncs,
      COALESCE(
        (SELECT json_agg(ne) FROM nota_empenho ne WHERE ne.nc_id = nc.id ORDER BY dataInclusao DESC),
        '[]'
      ) AS nes
    FROM nota_credito nc
    ORDER BY nc.dataInclusao DESC
  `;
  try {
    const { rows } = await pool.query(query);
    const result = rows.map(nc => {
      // Garante arrays reais mesmo se vierem como string (evita bug de serialização)
      const subncs = typeof nc.subncs === 'string' ? JSON.parse(nc.subncs) : (nc.subncs || []);
      const nes = typeof nc.nes === 'string' ? JSON.parse(nc.nes) : (nc.nes || []);
      const totalSubnc = Array.isArray(subncs) ? subncs.reduce((acc, sub) => acc.plus(new Decimal(sub.valor)), new Decimal(0)) : new Decimal(0);
      const totalNe = Array.isArray(nes) ? nes.reduce((acc, ne) => acc.plus(new Decimal(ne.valor)), new Decimal(0)) : new Decimal(0);
      return {
        ...nc,
        subncs,
        nes,
        saldo_atual: new Decimal(nc.valor).plus(totalSubnc).minus(totalNe).toFixed(2)
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar NC por ID
app.get('/api/nc/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM nota_credito WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Editar NC
app.put('/api/nc/:id', async (req, res) => {
  const { id } = req.params;
  const { ug_id, numero, data_emissao, descricao, prazo, nd, esfera, ptres, fonte, pi, responsavel, valor } = req.body;
  const query = `
    UPDATE nota_credito SET
      ug_id = $1, numero = $2, data_emissao = $3, descricao = $4, prazo = $5, nd = $6,
      esfera = $7, ptres = $8, fonte = $9, pi = $10, responsavel = $11, valor = $12
    WHERE id = $13 RETURNING *
  `;
  const values = [ug_id, numero, data_emissao, descricao, prazo, nd, esfera, ptres, fonte, pi, responsavel, valor, id];
  try {
    const { rows } = await pool.query(query, values);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Excluir NC
app.delete('/api/nc/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM nota_credito WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== SubNC (Reforço de NC) ==================

// Adicionar SubNC
app.post('/api/nc/:id/subnc', async (req, res) => {
  const nc_id = req.params.id;
  // Aceita tanto "desc" (frontend antigo) quanto "descricao" (backend novo)
  const { nc, data, desc, descricao, valor } = req.body;
  const descFinal = desc || descricao || '';
  const query = `
    INSERT INTO subnc (nc_id, nc, data, descricao, valor)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const values = [nc_id, nc, data, descFinal, valor];
  try {
    const { rows } = await pool.query(query, values);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar SubNCs de uma NC
app.get('/api/nc/:id/subncs', async (req, res) => {
  const nc_id = req.params.id;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM subnc WHERE nc_id = $1 ORDER BY data DESC',
      [nc_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Editar SubNC
app.put('/api/nc/:id/subnc/:subncId', async (req, res) => {
  const { id, subncId } = req.params;
  const { nc, data, desc, descricao, valor } = req.body;
  const descFinal = desc || descricao || '';
  const query = `
    UPDATE subnc SET nc = $1, data = $2, descricao = $3, valor = $4
    WHERE id = $5 AND nc_id = $6
    RETURNING *
  `;
  const values = [nc, data, descFinal, valor, subncId, id];
  try {
    const { rows } = await pool.query(query, values);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Excluir SubNC
app.delete('/api/nc/:id/subnc/:subncId', async (req, res) => {
  const { id, subncId } = req.params;
  try {
    await pool.query('DELETE FROM subnc WHERE id = $1 AND nc_id = $2', [subncId, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== Nota de Empenho (NE) ==================

// Criar NE vinculada à NC
app.post('/api/ne', async (req, res) => {
  const { nc_id, numero, cnpj, valor, req: reqNe, nup } = req.body;
  const query = `
    INSERT INTO nota_empenho (nc_id, numero, cnpj, valor, req, nup, dataInclusao)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING *
  `;
  const values = [nc_id, numero, cnpj, valor, reqNe, nup];
  try {
    const { rows } = await pool.query(query, values);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar todas NEs
app.get('/api/nes', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM nota_empenho ORDER BY dataInclusao DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar NE por ID
app.get('/api/ne/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM nota_empenho WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar NEs de uma NC
app.get('/api/nes/nc/:nc_id', async (req, res) => {
  const { nc_id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM nota_empenho WHERE nc_id = $1 ORDER BY dataInclusao DESC', [nc_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Editar NE
app.put('/api/ne/:id', async (req, res) => {
  const { id } = req.params;
  const { nc_id, numero, cnpj, valor, req: reqNe, nup } = req.body;
  const query = `
    UPDATE nota_empenho SET
      nc_id = $1, numero = $2, cnpj = $3, valor = $4, req = $5, nup = $6
    WHERE id = $7 RETURNING *
  `;
  const values = [nc_id, numero, cnpj, valor, reqNe, nup, id];
  try {
    const { rows } = await pool.query(query, values);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Excluir NE
app.delete('/api/ne/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM nota_empenho WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reforço em NE
app.post('/api/ne/reforco', async (req, res) => {
  const { ne_id, valor } = req.body;
  const query = `
    UPDATE nota_empenho SET valor = valor + $2 WHERE id = $1 RETURNING *
  `;
  try {
    const { rows } = await pool.query(query, [ne_id, valor]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Anulação em NE
app.post('/api/ne/anulacao', async (req, res) => {
  const { ne_id, valor } = req.body;
  const query = `
    UPDATE nota_empenho SET valor = valor - $2 WHERE id = $1 RETURNING *
  `;
  try {
    const { rows } = await pool.query(query, [ne_id, valor]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== Gráfico por UG ==================
app.get('/api/grafico-por-ug', async (req, res) => {
  const query = `
    SELECT ug.nome, SUM(nc.valor) as total
    FROM unidade_gestora ug
    JOIN nota_credito nc ON nc.ug_id = ug.id
    GROUP BY ug.nome
  `;
  try {
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== Saldos/Diferença SIAFI x SIGECON ==================
app.get('/api/saldo-ug/:ug_id', async (req, res) => {
  const { ug_id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT SUM(valor) AS total FROM nota_credito WHERE ug_id = $1`,
      [ug_id]
    );
    res.json({ total: rows[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== Inicialização do servidor ==================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SIGECON backend rodando na porta ${PORT}`);
});