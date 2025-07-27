const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do banco Neon/Postgres
const pool = new Pool({
  host: 'ep-crimson-mode-aejyyt5m-pooler.c-2.us-east-2.aws.neon.tech',
  database: 'neondb',
  user: 'neondb_owner',
  password: 'npg_8cDPnmrpoJ4B',
  port: 5432,
  ssl: { rejectUnauthorized: false, require: true },
  channelBinding: 'require',
});

// ======= UG (Unidade Gestora) =======

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
    const { rows } = await pool.query('SELECT * FROM unidade_gestora');
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
    await pool.query('DELETE FROM unidade_gestora WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======= Nota de Crédito (NC) =======

// Criar NC
app.post('/api/nc', async (req, res) => {
  const { ug_id, numero, data_emissao, descricao, prazo, nd, esfera, ptres, fonte, pi, responsavel, valor } = req.body;
  const query = `
    INSERT INTO nota_credito (
      ug_id, numero, data_emissao, descricao, prazo, nd, esfera, ptres, fonte, pi, responsavel, valor
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
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

// Listar todas NCs
app.get('/api/ncs', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM nota_credito');
    res.json(rows);
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

// ======= Nota de Empenho (NE) =======

// Criar NE vinculada à NC
app.post('/api/ne', async (req, res) => {
  const { nc_id, numero, cnpj, valor, req: reqNe, nup } = req.body;
  const query = `
    INSERT INTO nota_empenho (nc_id, numero, cnpj, valor, req, nup)
    VALUES ($1, $2, $3, $4, $5, $6)
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
    const { rows } = await pool.query('SELECT * FROM nota_empenho');
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
    const { rows } = await pool.query('SELECT * FROM nota_empenho WHERE nc_id = $1', [nc_id]);
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

// ======= Gráfico por UG =======
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

// Inicia o servidor
app.listen(3000, () => console.log('Servidor rodando na porta 3000'));