const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração da conexão Neon/Postgres
const pool = new Pool({
  host: 'ep-crimson-mode-aejyyt5m-pooler.c-2.us-east-2.aws.neon.tech',
  database: 'neondb',
  user: 'neondb_owner',
  password: 'npg_8cDPnmrpoJ4B', // Coloque sua senha real aqui!
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
    require: true,
  },
  channelBinding: 'require'
});

// Endpoint: Buscar Notas de Crédito com filtros
app.post('/api/ncs', async (req, res) => {
  const { ug_id, prazo, pi, responsavel } = req.body;
  const query = `
    SELECT * FROM nota_credito
    WHERE ($1::int IS NULL OR ug_id = $1)
      AND ($2::date IS NULL OR prazo = $2)
      AND ($3::text IS NULL OR pi = $3)
      AND ($4::text IS NULL OR responsavel ILIKE '%' || $4 || '%')
  `;
  const values = [
    ug_id || null,
    prazo || null,
    pi || null,
    responsavel || null
  ];
  try {
    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Criar nova Nota de Crédito
app.post('/api/nc', async (req, res) => {
  const { ug_id, numero, data_emissao, descricao, prazo, nd, esfera, ptres, fonte, pi, responsavel, valor } = req.body;
  const query = `
    INSERT INTO nota_credito (ug_id, numero, data_emissao, descricao, prazo, nd, esfera, ptres, fonte, pi, responsavel, valor)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *
  `;
  const values = [ug_id, numero, data_emissao, descricao, prazo, nd, esfera, ptres, fonte, pi, responsavel, valor];
  try {
    const { rows } = await pool.query(query, values);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Dados para gráfico (total por UG)
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