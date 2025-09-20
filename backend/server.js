// SIGECON Backend Unificado - Express + Neon/Postgres (ESM version)
// Todas as rotas NC (Nota de Crédito) padronizadas para /api/nota_credito

import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;
import Decimal from 'decimal.js';

const app = express();
app.use(cors());
app.use(express.json());

// ================== CONFIGURAÇÃO DO BANCO NEON/POSTGRES ==================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_8cDPnmrpoJ4B@ep-crimson-mode-aejyyt5m-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false, require: true }
});

// ================== UTILIDADE MOEDA BRL ==================
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

// Criar Nota de Crédito
app.post('/api/nota_credito', async (req, res) => {
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

// ================== RECOLHIMENTOS DE CRÉDITO ==================

// Adicionar recolhimento
app.post('/api/nota_credito/:id/recolhimento', async (req, res) => {
  const nc_id = req.params.id;
  const { numero, descricao, valor } = req.body;
  console.log('RECEBIDO:', { nc_id, numero, descricao, valor }); // debug
  if (!numero || !descricao || !valor) {
    return res.status(400).json({ error: "Campos obrigatórios: numero, descricao, valor" });
  }
  try {
    const query = `
      INSERT INTO recolhimentos (nc_id, numero, descricao, valor)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [nc_id, numero, descricao, valor];
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('ERRO AO INSERIR RECOLHIMENTO:', err); // debug
    res.status(500).json({ error: err.message });
  }
});

// Listar recolhimentos de uma NC
app.get('/api/nota_credito/:id/recolhimentos', async (req, res) => {
  const nc_id = req.params.id;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM recolhimentos WHERE nc_id = $1 ORDER BY data DESC', [nc_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Editar recolhimento
app.put('/api/nota_credito/:id/recolhimento/:recId', async (req, res) => {
  const { id, recId } = req.params;
  const { numero, descricao, valor } = req.body;
  try {
    const query = `
      UPDATE recolhimentos SET numero = $1, descricao = $2, valor = $3
      WHERE id = $4 AND nc_id = $5
      RETURNING *
    `;
    const values = [numero, descricao, valor, recId, id];
    const { rows } = await pool.query(query, values);
    if (!rows.length) return res.status(404).json({ error: 'Recolhimento não encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Excluir recolhimento
app.delete('/api/nota_credito/:id/recolhimento/:recId', async (req, res) => {
  const { id, recId } = req.params;
  try {
    await pool.query('DELETE FROM recolhimentos WHERE id = $1 AND nc_id = $2', [recId, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar todas Notas de Crédito (AGORA COM LANCAMENTOS EMBUTIDOS NAS NEs E RECOLHIMENTOS)
app.get('/api/nota_credito', async (req, res) => {
  const query = `
    SELECT 
      nc.*,
      COALESCE(subncs.subncs, '[]') AS subncs,
      COALESCE(nes.nes, '[]') AS nes,
      COALESCE(recs.recolhimentos, '[]') AS recolhimentos
    FROM nota_credito nc
    LEFT JOIN LATERAL (
      SELECT json_agg(s ORDER BY s.data DESC) AS subncs
      FROM subnc s WHERE s.nc_id = nc.id
    ) subncs ON TRUE
    LEFT JOIN LATERAL (
      SELECT json_agg(n ORDER BY n.dataInclusao DESC) AS nes
      FROM nota_empenhos n WHERE n.nc_id = nc.id
    ) nes ON TRUE
    LEFT JOIN LATERAL (
      SELECT json_agg(r ORDER BY r.data DESC) AS recolhimentos
      FROM recolhimentos r WHERE r.nc_id = nc.id
    ) recs ON TRUE
    ORDER BY nc.dataInclusao DESC
  `;
  try {
    const { rows } = await pool.query(query);
    // Adiciona os lançamentos embutidos em cada NE
    const result = await Promise.all(rows.map(async nc => {
      let subncs = [];
      let nes = [];
      let recolhimentos = [];
      try {
        subncs = Array.isArray(nc.subncs) ? nc.subncs : JSON.parse(nc.subncs || "[]");
      } catch { subncs = []; }
      try {
        nes = Array.isArray(nc.nes) ? nc.nes : JSON.parse(nc.nes || "[]");
      } catch { nes = []; }
      try {
        recolhimentos = Array.isArray(nc.recolhimentos) ? nc.recolhimentos : JSON.parse(nc.recolhimentos || "[]");
      } catch { recolhimentos = []; }
      // Embute lançamentos em cada NE
      for (const ne of nes) {
        try {
          const { rows: lancs } = await pool.query(
            'SELECT * FROM ne_lancamentos WHERE ne_id = $1 ORDER BY data ASC', [ne.id]);
          ne.lancamentos = lancs.map(lanc => ({
            ...lanc,
            tipo: lanc.tipo === 'reforco' ? 'lanc-reforco'
                 : lanc.tipo === 'anulacao' ? 'lanc-anulacao'
                 : lanc.tipo
          }));
        } catch { ne.lancamentos = []; }
      }
      const totalSubnc = subncs.reduce((acc, sub) => acc.plus(new Decimal(sub.valor || 0)), new Decimal(0));
      const totalNe = nes.reduce((acc, ne) => acc.plus(new Decimal(ne.valor || 0)), new Decimal(0));
      const totalRecolhidos = recolhimentos.reduce((acc, rec) => acc.plus(new Decimal(rec.valor || 0)), new Decimal(0));
      return {
        ...nc,
        subncs,
        nes,
        recolhimentos,
        saldo_atual: new Decimal(nc.valor || 0).plus(totalSubnc).minus(totalNe).minus(totalRecolhidos).toFixed(2)
      };
    }));
    res.json(result);
  } catch (err) {
    console.error('Erro em /api/nota_credito:', err);
    res.status(500).json({ error: err.message });
  }
});

// Buscar Nota de Crédito por ID
app.get('/api/nota_credito/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM nota_credito WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Editar Nota de Crédito
app.put('/api/nota_credito/:id', async (req, res) => {
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

// Excluir Nota de Crédito
app.delete('/api/nota_credito/:id', async (req, res) => {
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
app.post('/api/nota_credito/:id/subnc', async (req, res) => {
  const nc_id = req.params.id;
  const { nc, data, desc, valor } = req.body;
  const descFinal = desc || '';
  const query = `
    INSERT INTO subnc (nc_id, nc, data, "desc", valor)
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
app.get('/api/nota_credito/:id/subncs', async (req, res) => {
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
app.put('/api/nota_credito/:id/subnc/:subncId', async (req, res) => {
  const { id, subncId } = req.params;
  const { nc, data, desc, descricao, valor } = req.body;
  const descFinal = desc || descricao || '';
  const query = `
    UPDATE subnc SET nc = $1, data = $2, "desc" = $3, valor = $4
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
app.delete('/api/nota_credito/:id/subnc/:subncId', async (req, res) => {
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
app.post('/api/nes', async (req, res) => {
  const { nc_id, numero, cnpj, valor, req: reqNe, nup } = req.body;
  const query = `
    INSERT INTO nota_empenhos (nc_id, numero, cnpj, valor, req, nup, dataInclusao)
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
    const { rows } = await pool.query('SELECT * FROM nota_empenhos ORDER BY dataInclusao DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar NE por ID
app.get('/api/nes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM nota_empenhos WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar NEs de uma NC
app.get('/api/nes/nc/:nc_id', async (req, res) => {
  const { nc_id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM nota_empenhos WHERE nc_id = $1 ORDER BY dataInclusao DESC', [nc_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Editar NE
app.put('/api/nes/:id', async (req, res) => {
  const { id } = req.params;
  const { nc_id, numero, cnpj, valor, req: reqNe, nup } = req.body;
  const query = `
    UPDATE nota_empenhos SET
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
app.delete('/api/nes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM nota_empenhos WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== LANÇAMENTOS DE REFORÇO/ANULAÇÃO EM NE ==================
// OBS: Execute no banco antes o seguinte SQL:
//
// CREATE TABLE ne_lancamentos (
//   id SERIAL PRIMARY KEY,
//   ne_id INTEGER NOT NULL REFERENCES nota_empenhos(id) ON DELETE CASCADE,
//   tipo VARCHAR(12) NOT NULL CHECK (tipo IN ('reforco', 'anulacao')),
//   valor NUMERIC(15,2) NOT NULL,
//   descricao VARCHAR(255),
//   data TIMESTAMP NOT NULL DEFAULT NOW()
// );

// Listar lançamentos de uma NE (normaliza tipo para lanc-reforco/lanc-anulacao)
app.get('/api/nes/:ne_id/lancamentos', async (req, res) => {
  const { ne_id } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM ne_lancamentos WHERE ne_id = $1 ORDER BY data ASC', [ne_id]);
    // Normaliza tipo para "lanc-reforco"/"lanc-anulacao" no retorno
    const result = rows.map(lanc => ({
      ...lanc,
      tipo: lanc.tipo === 'reforco' ? 'lanc-reforco'
           : lanc.tipo === 'anulacao' ? 'lanc-anulacao'
           : lanc.tipo
    }));
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Adicionar lançamento (reforço/anulação) em uma NE (NÃO altera valor da NE!)
app.post('/api/nes/:ne_id/lancamentos', async (req, res) => {
  const { ne_id } = req.params;
  let { tipo, valor, descricao } = req.body;
  // Normaliza possíveis nomes vindos do frontend
  if (tipo === 'lanc-reforco') tipo = 'reforco';
  if (tipo === 'lanc-anulacao') tipo = 'anulacao';
  if (!ne_id || !tipo || !valor) return res.status(400).json({ error: 'Campos obrigatórios: ne_id, tipo, valor.' });
  if (!['reforco','anulacao'].includes(tipo)) return res.status(400).json({ error: 'Tipo inválido.' });
  try {
    // Insere lançamento (NÃO altera valor da NE!)
    const { rows: lancRows } = await pool.query(
      'INSERT INTO ne_lancamentos (ne_id, tipo, valor, descricao) VALUES ($1, $2, $3, $4) RETURNING *',
      [ne_id, tipo, valor, descricao || null]
    );
    // Busca NE atualizada
    const { rows: neRows } = await pool.query('SELECT * FROM nota_empenhos WHERE id = $1', [ne_id]);
    // Normaliza tipo no retorno
    const lancRet = {
      ...lancRows[0],
      tipo: lancRows[0].tipo === 'reforco' ? 'lanc-reforco'
           : lancRows[0].tipo === 'anulacao' ? 'lanc-anulacao'
           : lancRows[0].tipo
    };
    res.json({ lancamento: lancRet, ne: neRows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Excluir lançamento de NE (NÃO altera valor da NE!)
app.delete('/api/nes/:ne_id/lancamentos/:lanc_id', async (req, res) => {
  const { ne_id, lanc_id } = req.params;
  try {
    // Busca o lançamento para saber tipo/valor
    const { rows: lancRows } = await pool.query(
      'SELECT * FROM ne_lancamentos WHERE id = $1 AND ne_id = $2', [lanc_id, ne_id]);
    if (!lancRows.length) return res.status(404).json({ error: 'Lançamento não encontrado.' });
    // Remove o lançamento (NÃO altera valor da NE!)
    await pool.query('DELETE FROM ne_lancamentos WHERE id = $1 AND ne_id = $2', [lanc_id, ne_id]);
    // Busca NE atualizada
    const { rows: neRows } = await pool.query('SELECT * FROM nota_empenhos WHERE id = $1', [ne_id]);
    // Normaliza tipo no retorno
    const lancTipo = lancRows[0].tipo === 'reforco' ? 'lanc-reforco'
                   : lancRows[0].tipo === 'anulacao' ? 'lanc-anulacao'
                   : lancRows[0].tipo;
    res.json({ success: true, ne: neRows[0], tipo: lancTipo });
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

// ================== Saldos / Diferença SIAFI x SIGECON ==================
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

// Salvar anexo (PDF) de NC ou NE
app.post('/api/anexos', async (req, res) => {
  const { idNota, tipo, nomeArquivo, urlCloudinary } = req.body;
  if (!idNota || !tipo || !nomeArquivo || !urlCloudinary) {
    return res.status(400).json({ success: false, error: 'Campos obrigatórios faltando.' });
  }
  try {
    const query = `
      INSERT INTO anexos (tipo, idNota, nomeArquivo, urlCloudinary)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [tipo, idNota, nomeArquivo, urlCloudinary];
    const { rows } = await pool.query(query, values);
    res.json({ success: true, anexo: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Listar anexos de uma NC ou NE
app.get('/api/anexos', async (req, res) => {
  const { tipo, idNota } = req.query;
  if (!tipo || !idNota) {
    return res.status(400).json({ error: 'Parâmetros tipo e idNota são obrigatórios.' });
  }
  try {
    const { rows } = await pool.query(
      'SELECT * FROM anexos WHERE tipo = $1 AND idNota = $2 ORDER BY dataInclusao DESC',
      [tipo, idNota]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});