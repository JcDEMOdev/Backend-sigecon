// ================== unidade_gestora ==================
app.post('/api/unidade_gestora', async (req, res) => {
  const { nome } = req.body;
  try {
    const { rows } = await pool.query('INSERT INTO unidade_gestora (nome) VALUES ($1) RETURNING *', [nome]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/unidade_gestora', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM unidade_gestora ORDER BY nome ASC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/unidade_gestora/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM unidade_gestora WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/unidade_gestora/:id', async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  try {
    const { rows } = await pool.query('UPDATE unidade_gestora SET nome = $1 WHERE id = $2 RETURNING *', [nome, id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/unidade_gestora/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('SELECT 1 FROM nota_credito WHERE ug_id = $1', [id]);
    if (rowCount) return res.status(409).json({ error: 'UG em uso em NCs.' });
    await pool.query('DELETE FROM unidade_gestora WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ================== unidade_gestora_167368 ==================
app.post('/api/unidade_gestora_167368', async (req, res) => {
  const { nome } = req.body;
  try {
    const { rows } = await pool.query('INSERT INTO unidade_gestora_167368 (nome) VALUES ($1) RETURNING *', [nome]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/unidade_gestora_167368', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM unidade_gestora_167368 ORDER BY nome ASC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/unidade_gestora_167368/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM unidade_gestora_167368 WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/unidade_gestora_167368/:id', async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  try {
    const { rows } = await pool.query('UPDATE unidade_gestora_167368 SET nome = $1 WHERE id = $2 RETURNING *', [nome, id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/unidade_gestora_167368/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('SELECT 1 FROM nota_credito_167368 WHERE ug_id = $1', [id]);
    if (rowCount) return res.status(409).json({ error: 'UG em uso em NCs.' });
    await pool.query('DELETE FROM unidade_gestora_167368 WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ================== nota_credito ==================
app.post('/api/nota_credito', async (req, res) => {
  const { ug_id, numero, data_emissao, descricao, prazo, nd, esfera, ptres, fonte, pi, responsavel, valor } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO nota_credito 
      (ug_id, numero, data_emissao, descricao, prazo, nd, esfera, ptres, fonte, pi, responsavel, valor, datainclusao)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW()) RETURNING *`,
      [ug_id, numero, data_emissao, descricao, prazo, nd, esfera, ptres, fonte, pi, responsavel, valor]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/nota_credito', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM nota_credito ORDER BY datainclusao DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/nota_credito/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM nota_credito WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/nota_credito/:id', async (req, res) => {
  const { id } = req.params;
  const { ug_id, numero, data_emissao, descricao, prazo, nd, esfera, ptres, fonte, pi, responsavel, valor } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE nota_credito SET
        ug_id = $1, numero = $2, data_emissao = $3, descricao = $4, prazo = $5, nd = $6, esfera = $7, ptres = $8,
        fonte = $9, pi = $10, responsavel = $11, valor = $12
      WHERE id = $13 RETURNING *`,
      [ug_id, numero, data_emissao, descricao, prazo, nd, esfera, ptres, fonte, pi, responsavel, valor, id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/nota_credito/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM nota_credito WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ================== nota_credito_167368 ==================
app.post('/api/nota_credito_167368', async (req, res) => {
  const { ug_id, numero, data_emissao, descricao, prazo, nd, esfera, ptres, fonte, pi, responsavel, valor } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO nota_credito_167368 
      (ug_id, numero, data_emissao, descricao, prazo, nd, esfera, ptres, fonte, pi, responsavel, valor, datainclusao)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW()) RETURNING *`,
      [ug_id, numero, data_emissao, descricao, prazo, nd, esfera, ptres, fonte, pi, responsavel, valor]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/nota_credito_167368', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM nota_credito_167368 ORDER BY datainclusao DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/nota_credito_167368/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM nota_credito_167368 WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/nota_credito_167368/:id', async (req, res) => {
  const { id } = req.params;
  const { ug_id, numero, data_emissao, descricao, prazo, nd, esfera, ptres, fonte, pi, responsavel, valor } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE nota_credito_167368 SET
        ug_id = $1, numero = $2, data_emissao = $3, descricao = $4, prazo = $5, nd = $6, esfera = $7, ptres = $8,
        fonte = $9, pi = $10, responsavel = $11, valor = $12
      WHERE id = $13 RETURNING *`,
      [ug_id, numero, data_emissao, descricao, prazo, nd, esfera, ptres, fonte, pi, responsavel, valor, id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/nota_credito_167368/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM nota_credito_167368 WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ================== subnc ==================
app.post('/api/subnc', async (req, res) => {
  const { nc_id, nc, data, descricao, valor } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO subnc (nc_id, nc, data, descricao, valor, datainclusao, data_inclusao)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
      [nc_id, nc, data, descricao, valor]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/subnc', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM subnc ORDER BY data DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/subnc/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM subnc WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/subnc/:id', async (req, res) => {
  const { id } = req.params;
  const { nc, data, descricao, valor } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE subnc SET nc = $1, data = $2, descricao = $3, valor = $4 WHERE id = $5 RETURNING *`,
      [nc, data, descricao, valor, id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/subnc/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM subnc WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ================== subnc_167368 ==================
app.post('/api/subnc_167368', async (req, res) => {
  const { nc_id, nc, data, descricao, valor } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO subnc_167368 (nc_id, nc, data, descricao, valor, datainclusao, data_inclusao)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
      [nc_id, nc, data, descricao, valor]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/subnc_167368', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM subnc_167368 ORDER BY data DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/subnc_167368/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM subnc_167368 WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/subnc_167368/:id', async (req, res) => {
  const { id } = req.params;
  const { nc, data, descricao, valor } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE subnc_167368 SET nc = $1, data = $2, descricao = $3, valor = $4 WHERE id = $5 RETURNING *`,
      [nc, data, descricao, valor, id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/subnc_167368/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM subnc_167368 WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
// ================== nota_empenhos ==================
app.post('/api/nota_empenhos', async (req, res) => {
  const { nc_id, numero, cnpj, valor, req: reqNe, nup } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO nota_empenhos (nc_id, numero, cnpj, valor, req, nup, datainclusao)
      VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
      [nc_id, numero, cnpj, valor, reqNe, nup]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/nota_empenhos', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM nota_empenhos ORDER BY datainclusao DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/nota_empenhos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM nota_empenhos WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/nota_empenhos/nc/:nc_id', async (req, res) => {
  const { nc_id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM nota_empenhos WHERE nc_id = $1 ORDER BY datainclusao DESC', [nc_id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/nota_empenhos/:id', async (req, res) => {
  const { id } = req.params;
  const { nc_id, numero, cnpj, valor, req: reqNe, nup } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE nota_empenhos SET nc_id = $1, numero = $2, cnpj = $3, valor = $4, req = $5, nup = $6 WHERE id = $7 RETURNING *`,
      [nc_id, numero, cnpj, valor, reqNe, nup, id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/nota_empenhos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM nota_empenhos WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ================== nota_empenho_167368 ==================
app.post('/api/nota_empenho_167368', async (req, res) => {
  const { nc_id, numero, cnpj, valor, req: reqNe, nup } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO nota_empenho_167368 (nc_id, numero, cnpj, valor, req, nup, datainclusao)
      VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
      [nc_id, numero, cnpj, valor, reqNe, nup]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/nota_empenho_167368', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM nota_empenho_167368 ORDER BY datainclusao DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/nota_empenho_167368/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM nota_empenho_167368 WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/nota_empenho_167368/nc/:nc_id', async (req, res) => {
  const { nc_id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM nota_empenho_167368 WHERE nc_id = $1 ORDER BY datainclusao DESC', [nc_id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/nota_empenho_167368/:id', async (req, res) => {
  const { id } = req.params;
  const { nc_id, numero, cnpj, valor, req: reqNe, nup } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE nota_empenho_167368 SET nc_id = $1, numero = $2, cnpj = $3, valor = $4, req = $5, nup = $6 WHERE id = $7 RETURNING *`,
      [nc_id, numero, cnpj, valor, reqNe, nup, id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/nota_empenho_167368/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM nota_empenho_167368 WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ================== ne_lancamentos ==================
app.post('/api/ne_lancamentos', async (req, res) => {
  const { ne_id, tipo, valor, descricao } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO ne_lancamentos (ne_id, tipo, valor, descricao, data)
      VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [ne_id, tipo, valor, descricao]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/ne_lancamentos', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM ne_lancamentos ORDER BY data ASC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/ne_lancamentos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM ne_lancamentos WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/ne_lancamentos/ne/:ne_id', async (req, res) => {
  const { ne_id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM ne_lancamentos WHERE ne_id = $1 ORDER BY data ASC', [ne_id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/ne_lancamentos/:id', async (req, res) => {
  const { id } = req.params;
  const { tipo, valor, descricao } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE ne_lancamentos SET tipo = $1, valor = $2, descricao = $3 WHERE id = $4 RETURNING *`,
      [tipo, valor, descricao, id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/ne_lancamentos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM ne_lancamentos WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ================== ne_lancamento_167368 ==================
app.post('/api/ne_lancamento_167368', async (req, res) => {
  const { ne_id, tipo, valor, descricao } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO ne_lancamento_167368 (ne_id, tipo, valor, descricao, data)
      VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [ne_id, tipo, valor, descricao]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/ne_lancamento_167368', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM ne_lancamento_167368 ORDER BY data ASC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/ne_lancamento_167368/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM ne_lancamento_167368 WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/ne_lancamento_167368/ne/:ne_id', async (req, res) => {
  const { ne_id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM ne_lancamento_167368 WHERE ne_id = $1 ORDER BY data ASC', [ne_id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/ne_lancamento_167368/:id', async (req, res) => {
  const { id } = req.params;
  const { tipo, valor, descricao } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE ne_lancamento_167368 SET tipo = $1, valor = $2, descricao = $3 WHERE id = $4 RETURNING *`,
      [tipo, valor, descricao, id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/ne_lancamento_167368/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM ne_lancamento_167368 WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ================== recolhimentos ==================
app.post('/api/recolhimentos', async (req, res) => {
  const { nc_id, numero, descricao, valor } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO recolhimentos (nc_id, numero, descricao, valor, data)
      VALUES ($1, $2, $3, $4, CURRENT_DATE) RETURNING *`,
      [nc_id, numero, descricao, valor]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/recolhimentos', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM recolhimentos ORDER BY data DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/recolhimentos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM recolhimentos WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/recolhimentos/nc/:nc_id', async (req, res) => {
  const { nc_id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM recolhimentos WHERE nc_id = $1 ORDER BY data DESC', [nc_id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/recolhimentos/:id', async (req, res) => {
  const { id } = req.params;
  const { numero, descricao, valor } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE recolhimentos SET numero = $1, descricao = $2, valor = $3 WHERE id = $4 RETURNING *`,
      [numero, descricao, valor, id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/recolhimentos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM recolhimentos WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ================== recolhimento_167368 ==================
app.post('/api/recolhimento_167368', async (req, res) => {
  const { nc_id, numero, descricao, valor } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO recolhimento_167368 (nc_id, numero, descricao, valor, data)
      VALUES ($1, $2, $3, $4, CURRENT_DATE) RETURNING *`,
      [nc_id, numero, descricao, valor]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/recolhimento_167368', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM recolhimento_167368 ORDER BY data DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/recolhimento_167368/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM recolhimento_167368 WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/recolhimento_167368/nc/:nc_id', async (req, res) => {
  const { nc_id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM recolhimento_167368 WHERE nc_id = $1 ORDER BY data DESC', [nc_id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/recolhimento_167368/:id', async (req, res) => {
  const { id } = req.params;
  const { numero, descricao, valor } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE recolhimento_167368 SET numero = $1, descricao = $2, valor = $3 WHERE id = $4 RETURNING *`,
      [numero, descricao, valor, id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/recolhimento_167368/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM recolhimento_167368 WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
// ========== ANEXOS (PDF Supabase Storage) - PADRÃO ==========
app.post('/api/anexos', async (req, res) => {
  const { idnota, tipo } = req.body;
  const file = req.files?.arquivo;
  if (!idnota || !tipo || !file) {
    return res.status(400).json({ success: false, error: 'Campos obrigatórios faltando.' });
  }
  try {
    const nomeArquivo = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from('sigecon-notas')
      .upload(nomeArquivo, file.data, {
        contentType: file.mimetype,
        upsert: false,
      });
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
    const { publicUrl } = supabase.storage
      .from('sigecon-notas')
      .getPublicUrl(nomeArquivo);
    const query = `
      INSERT INTO anexos (tipo, idnota, nomearquivo, urlsupabase, datainclusao)
      VALUES ($1, $2, $3, $4, NOW()) RETURNING *
    `;
    const values = [tipo, idnota, nomeArquivo, publicUrl];
    const { rows } = await pool.query(query, values);
    res.json({ success: true, anexo: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get('/api/anexos', async (req, res) => {
  const { tipo, idnota } = req.query;
  if (!tipo || !idnota) {
    return res.status(400).json({ error: 'Parâmetros tipo e idnota são obrigatórios.' });
  }
  try {
    const { rows } = await pool.query(
      'SELECT * FROM anexos WHERE tipo = $1 AND idnota = $2 ORDER BY datainclusao DESC',
      [tipo, idnota]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ANEXOS (PDF Supabase Storage) - 167368 ==========
app.post('/api/anexos_167368', async (req, res) => {
  const { idnota, tipo } = req.body;
  const file = req.files?.arquivo;
  if (!idnota || !tipo || !file) {
    return res.status(400).json({ success: false, error: 'Campos obrigatórios faltando.' });
  }
  try {
    const nomeArquivo = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from('sigecon-notas')
      .upload(nomeArquivo, file.data, {
        contentType: file.mimetype,
        upsert: false,
      });
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
    const { publicUrl } = supabase.storage
      .from('sigecon-notas')
      .getPublicUrl(nomeArquivo);
    const query = `
      INSERT INTO anexos_167368 (tipo, idnota, nomearquivo, urlsupabase, datainclusao)
      VALUES ($1, $2, $3, $4, NOW()) RETURNING *
    `;
    const values = [tipo, idnota, nomeArquivo, publicUrl];
    const { rows } = await pool.query(query, values);
    res.json({ success: true, anexo: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get('/api/anexos_167368', async (req, res) => {
  const { tipo, idnota } = req.query;
  if (!tipo || !idnota) {
    return res.status(400).json({ error: 'Parâmetros tipo e idnota são obrigatórios.' });
  }
  try {
    const { rows } = await pool.query(
      'SELECT * FROM anexos_167368 WHERE tipo = $1 AND idnota = $2 ORDER BY datainclusao DESC',
      [tipo, idnota]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ========== LINK DROP-NOTES - PADRÃO ==========
app.put('/api/nota_credito/:id/link_dropnotes', async (req, res) => {
  const { id } = req.params;
  const { linkDropNotes, subNcId } = req.body;
  try {
    if (subNcId) {
      const { rowCount } = await pool.query(
        'UPDATE subnc SET link_dropnotes = $1 WHERE id = $2 AND nc_id = $3',
        [linkDropNotes, subNcId, id]
      );
      if (!rowCount) return res.status(404).json({ success: false, error: "SubNC não encontrada" });
      return res.json({ success: true, updated: 'subnc', subNcId });
    } else {
      const { rowCount } = await pool.query(
        'UPDATE nota_credito SET link_dropnotes = $1 WHERE id = $2',
        [linkDropNotes, id]
      );
      if (!rowCount) return res.status(404).json({ success: false, error: "Nota de Crédito não encontrada" });
      return res.json({ success: true, updated: 'nc', id });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: "Erro interno no servidor" });
  }
});
app.put('/api/nes/:id/link_dropnotes', async (req, res) => {
  const { id } = req.params;
  const { linkDropNotes } = req.body;
  try {
    await pool.query('UPDATE nota_empenhos SET link_dropnotes = $1 WHERE id = $2', [linkDropNotes, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== LINK DROP-NOTES - 167368 ==========
app.put('/api/nota_credito_167368/:id/link_dropnotes', async (req, res) => {
  const { id } = req.params;
  const { linkDropNotes, subNcId } = req.body;
  try {
    if (subNcId) {
      const { rowCount } = await pool.query(
        'UPDATE subnc_167368 SET link_dropnotes = $1 WHERE id = $2 AND nc_id = $3',
        [linkDropNotes, subNcId, id]
      );
      if (!rowCount) return res.status(404).json({ success: false, error: "SubNC não encontrada" });
      return res.json({ success: true, updated: 'subnc', subNcId });
    } else {
      const { rowCount } = await pool.query(
        'UPDATE nota_credito_167368 SET link_dropnotes = $1 WHERE id = $2',
        [linkDropNotes, id]
      );
      if (!rowCount) return res.status(404).json({ success: false, error: "Nota de Crédito não encontrada" });
      return res.json({ success: true, updated: 'nc', id });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: "Erro interno no servidor" });
  }
});
app.put('/api/nes_167368/:id/link_dropnotes', async (req, res) => {
  const { id } = req.params;
  const { linkDropNotes } = req.body;
  try {
    await pool.query('UPDATE nota_empenho_167368 SET link_dropnotes = $1 WHERE id = $2', [linkDropNotes, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ========== NOTA DE CRÉDITO AGREGADA - PADRÃO ==========
app.get('/api/nota_credito_agregada', async (req, res) => {
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
      SELECT json_agg(n ORDER BY n.datainclusao DESC) AS nes
      FROM nota_empenhos n WHERE n.nc_id = nc.id
    ) nes ON TRUE
    LEFT JOIN LATERAL (
      SELECT json_agg(r ORDER BY r.data DESC) AS recolhimentos
      FROM recolhimentos r WHERE r.nc_id = nc.id
    ) recs ON TRUE
    ORDER BY nc.datainclusao DESC
  `;
  try {
    const { rows } = await pool.query(query);
    const result = await Promise.all(rows.map(async nc => {
      let subncs = [];
      let nes = [];
      let recolhimentos = [];
      try { subncs = Array.isArray(nc.subncs) ? nc.subncs : JSON.parse(nc.subncs || "[]"); } catch { subncs = []; }
      try { nes = Array.isArray(nc.nes) ? nc.nes : JSON.parse(nc.nes || "[]"); } catch { nes = []; }
      try { recolhimentos = Array.isArray(nc.recolhimentos) ? nc.recolhimentos : JSON.parse(nc.recolhimentos || "[]"); } catch { recolhimentos = []; }
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
    res.status(500).json({ error: err.message });
  }
});

// ========== NOTA DE CRÉDITO AGREGADA - 167368 ==========
app.get('/api/nota_credito_167368_agregada', async (req, res) => {
  const query = `
    SELECT 
      nc.*,
      COALESCE(subncs.subncs, '[]') AS subncs,
      COALESCE(nes.nes, '[]') AS nes,
      COALESCE(recs.recolhimentos, '[]') AS recolhimentos
    FROM nota_credito_167368 nc
    LEFT JOIN LATERAL (
      SELECT json_agg(s ORDER BY s.data DESC) AS subncs
      FROM subnc_167368 s WHERE s.nc_id = nc.id
    ) subncs ON TRUE
    LEFT JOIN LATERAL (
      SELECT json_agg(n ORDER BY n.datainclusao DESC) AS nes
      FROM nota_empenho_167368 n WHERE n.nc_id = nc.id
    ) nes ON TRUE
    LEFT JOIN LATERAL (
      SELECT json_agg(r ORDER BY r.data DESC) AS recolhimentos
      FROM recolhimento_167368 r WHERE r.nc_id = nc.id
    ) recs ON TRUE
    ORDER BY nc.datainclusao DESC
  `;
  try {
    const { rows } = await pool.query(query);
    const result = await Promise.all(rows.map(async nc => {
      let subncs = [];
      let nes = [];
      let recolhimentos = [];
      try { subncs = Array.isArray(nc.subncs) ? nc.subncs : JSON.parse(nc.subncs || "[]"); } catch { subncs = []; }
      try { nes = Array.isArray(nc.nes) ? nc.nes : JSON.parse(nc.nes || "[]"); } catch { nes = []; }
      try { recolhimentos = Array.isArray(nc.recolhimentos) ? nc.recolhimentos : JSON.parse(nc.recolhimentos || "[]"); } catch { recolhimentos = []; }
      for (const ne of nes) {
        try {
          const { rows: lancs } = await pool.query(
            'SELECT * FROM ne_lancamento_167368 WHERE ne_id = $1 ORDER BY data ASC', [ne.id]);
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
    res.status(500).json({ error: err.message });
  }
});
// ================== Gráfico por UG (principal) ==================
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

// ================== Gráfico por UG (167368) ==================
app.get('/api/grafico-por-ug-167368', async (req, res) => {
  const query = `
    SELECT ug.nome, SUM(nc.valor) as total
    FROM unidade_gestora_167368 ug
    JOIN nota_credito_167368 nc ON nc.ug_id = ug.id
    GROUP BY ug.nome
  `;
  try {
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== Saldos / Diferença SIAFI x SIGECON (principal) ==================
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

// ================== Saldos / Diferença SIAFI x SIGECON (167368) ==================
app.get('/api/saldo-ug-167368/:ug_id', async (req, res) => {
  const { ug_id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT SUM(valor) AS total FROM nota_credito_167368 WHERE ug_id = $1`,
      [ug_id]
    );
    res.json({ total: rows[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ================== Listar SubNCs de uma NC ==================
app.get('/api/nota_credito/:id/subncs', async (req, res) => {
  const nc_id = req.params.id;
  try {
    const { rows } = await pool.query('SELECT * FROM subnc WHERE nc_id = $1 ORDER BY data DESC', [nc_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/nota_credito_167368/:id/subncs', async (req, res) => {
  const nc_id = req.params.id;
  try {
    const { rows } = await pool.query('SELECT * FROM subnc_167368 WHERE nc_id = $1 ORDER BY data DESC', [nc_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== Listar NEs de uma NC ==================
app.get('/api/nes/nc/:nc_id', async (req, res) => {
  const { nc_id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM nota_empenhos WHERE nc_id = $1 ORDER BY datainclusao DESC', [nc_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/nota_empenho_167368/nc/:nc_id', async (req, res) => {
  const { nc_id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM nota_empenho_167368 WHERE nc_id = $1 ORDER BY datainclusao DESC', [nc_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== Listar lançamentos de uma NE ==================
app.get('/api/ne_lancamentos/ne/:ne_id', async (req, res) => {
  const { ne_id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM ne_lancamentos WHERE ne_id = $1 ORDER BY data ASC', [ne_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/ne_lancamento_167368/ne/:ne_id', async (req, res) => {
  const { ne_id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM ne_lancamento_167368 WHERE ne_id = $1 ORDER BY data ASC', [ne_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== Listar recolhimentos de uma NC ==================
app.get('/api/recolhimentos/nc/:nc_id', async (req, res) => {
  const { nc_id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM recolhimentos WHERE nc_id = $1 ORDER BY data DESC', [nc_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/recolhimento_167368/nc/:nc_id', async (req, res) => {
  const { nc_id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM recolhimento_167368 WHERE nc_id = $1 ORDER BY data DESC', [nc_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ================== NOTA DE CRÉDITO AGREGADA (com saldo) - principal ==================
app.get('/api/nota_credito_completo', async (req, res) => {
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
      SELECT json_agg(n ORDER BY n.datainclusao DESC) AS nes
      FROM nota_empenhos n WHERE n.nc_id = nc.id
    ) nes ON TRUE
    LEFT JOIN LATERAL (
      SELECT json_agg(r ORDER BY r.data DESC) AS recolhimentos
      FROM recolhimentos r WHERE r.nc_id = nc.id
    ) recs ON TRUE
    ORDER BY nc.datainclusao DESC
  `;
  try {
    const { rows } = await pool.query(query);
    const result = await Promise.all(rows.map(async nc => {
      let subncs = [];
      let nes = [];
      let recolhimentos = [];
      try { subncs = Array.isArray(nc.subncs) ? nc.subncs : JSON.parse(nc.subncs || "[]"); } catch { subncs = []; }
      try { nes = Array.isArray(nc.nes) ? nc.nes : JSON.parse(nc.nes || "[]"); } catch { nes = []; }
      try { recolhimentos = Array.isArray(nc.recolhimentos) ? nc.recolhimentos : JSON.parse(nc.recolhimentos || "[]"); } catch { recolhimentos = []; }
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
    res.status(500).json({ error: err.message });
  }
});

// ================== NOTA DE CRÉDITO AGREGADA (com saldo) - 167368 ==================
app.get('/api/nota_credito_167368_completo', async (req, res) => {
  const query = `
    SELECT 
      nc.*,
      COALESCE(subncs.subncs, '[]') AS subncs,
      COALESCE(nes.nes, '[]') AS nes,
      COALESCE(recs.recolhimentos, '[]') AS recolhimentos
    FROM nota_credito_167368 nc
    LEFT JOIN LATERAL (
      SELECT json_agg(s ORDER BY s.data DESC) AS subncs
      FROM subnc_167368 s WHERE s.nc_id = nc.id
    ) subncs ON TRUE
    LEFT JOIN LATERAL (
      SELECT json_agg(n ORDER BY n.datainclusao DESC) AS nes
      FROM nota_empenho_167368 n WHERE n.nc_id = nc.id
    ) nes ON TRUE
    LEFT JOIN LATERAL (
      SELECT json_agg(r ORDER BY r.data DESC) AS recolhimentos
      FROM recolhimento_167368 r WHERE r.nc_id = nc.id
    ) recs ON TRUE
    ORDER BY nc.datainclusao DESC
  `;
  try {
    const { rows } = await pool.query(query);
    const result = await Promise.all(rows.map(async nc => {
      let subncs = [];
      let nes = [];
      let recolhimentos = [];
      try { subncs = Array.isArray(nc.subncs) ? nc.subncs : JSON.parse(nc.subncs || "[]"); } catch { subncs = []; }
      try { nes = Array.isArray(nc.nes) ? nc.nes : JSON.parse(nc.nes || "[]"); } catch { nes = []; }
      try { recolhimentos = Array.isArray(nc.recolhimentos) ? nc.recolhimentos : JSON.parse(nc.recolhimentos || "[]"); } catch { recolhimentos = []; }
      for (const ne of nes) {
        try {
          const { rows: lancs } = await pool.query(
            'SELECT * FROM ne_lancamento_167368 WHERE ne_id = $1 ORDER BY data ASC', [ne.id]);
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
    res.status(500).json({ error: err.message });
  }
});

// ================== Inicialização do servidor ==================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SIGECON backend rodando na porta ${PORT}`);
});