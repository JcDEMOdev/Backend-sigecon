// Rotas para anexos de NCs/NEs
import express from 'express';
import pool from '../db.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// ================== ROTAS DE ANEXOS ==================

// Anexar arquivo (somente admin)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { idNota, tipo, nomeArquivo, urlCloudinary } = req.body;
  
  // Validação dos dados obrigatórios
  if (!idNota || !tipo || !nomeArquivo || !urlCloudinary) {
    return res.status(400).json({
      error: 'Campos obrigatórios: idNota, tipo, nomeArquivo, urlCloudinary',
      code: 'MISSING_FIELDS'
    });
  }
  
  // Validar tipo
  if (!['NC', 'NE'].includes(tipo.toUpperCase())) {
    return res.status(400).json({
      error: 'Tipo deve ser NC ou NE',
      code: 'INVALID_TYPE'
    });
  }
  
  try {
    // Verificar se a nota existe
    let checkQuery;
    if (tipo.toUpperCase() === 'NC') {
      checkQuery = 'SELECT id FROM nota_credito WHERE id = $1';
    } else {
      checkQuery = 'SELECT id FROM nota_empenhos WHERE id = $1';
    }
    
    const { rows: checkRows } = await pool.query(checkQuery, [idNota]);
    if (checkRows.length === 0) {
      return res.status(404).json({
        error: `${tipo.toUpperCase()} com ID ${idNota} não encontrada`,
        code: 'NOTE_NOT_FOUND'
      });
    }
    
    // Verificar se já existe anexo com o mesmo nome para a mesma nota
    const { rows: existingRows } = await pool.query(
      'SELECT id FROM anexos WHERE id_nota = $1 AND tipo = $2 AND nome_arquivo = $3 AND ativo = true',
      [idNota, tipo.toUpperCase(), nomeArquivo]
    );
    
    if (existingRows.length > 0) {
      return res.status(409).json({
        error: 'Já existe um anexo com este nome para esta nota',
        code: 'DUPLICATE_ATTACHMENT'
      });
    }
    
    // Inserir novo anexo
    const query = `
      INSERT INTO anexos (id_nota, tipo, nome_arquivo, url_cloudinary, usuario_upload)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [
      idNota,
      tipo.toUpperCase(),
      nomeArquivo,
      urlCloudinary,
      req.user.username
    ];
    
    const { rows } = await pool.query(query, values);
    
    res.status(201).json({
      message: 'Anexo criado com sucesso',
      anexo: rows[0]
    });
    
  } catch (err) {
    console.error('Erro ao criar anexo:', err);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
      details: err.message
    });
  }
});

// Listar anexos por nota e tipo (usuários autenticados)
router.get('/:tipo/:idNota', requireAuth, async (req, res) => {
  const { tipo, idNota } = req.params;
  
  // Validar tipo
  if (!['NC', 'NE'].includes(tipo.toUpperCase())) {
    return res.status(400).json({
      error: 'Tipo deve ser NC ou NE',
      code: 'INVALID_TYPE'
    });
  }
  
  // Validar idNota
  if (isNaN(parseInt(idNota))) {
    return res.status(400).json({
      error: 'ID da nota deve ser um número válido',
      code: 'INVALID_NOTE_ID'
    });
  }
  
  try {
    // Verificar se a nota existe
    let checkQuery;
    if (tipo.toUpperCase() === 'NC') {
      checkQuery = 'SELECT id, numero, descricao FROM nota_credito WHERE id = $1';
    } else {
      checkQuery = 'SELECT id, numero, req FROM nota_empenhos WHERE id = $1';
    }
    
    const { rows: checkRows } = await pool.query(checkQuery, [idNota]);
    if (checkRows.length === 0) {
      return res.status(404).json({
        error: `${tipo.toUpperCase()} com ID ${idNota} não encontrada`,
        code: 'NOTE_NOT_FOUND'
      });
    }
    
    // Buscar anexos
    const query = `
      SELECT 
        id,
        id_nota,
        tipo,
        nome_arquivo,
        url_cloudinary,
        data_upload,
        usuario_upload
      FROM anexos 
      WHERE id_nota = $1 AND tipo = $2 AND ativo = true
      ORDER BY data_upload DESC
    `;
    
    const { rows } = await pool.query(query, [idNota, tipo.toUpperCase()]);
    
    res.json({
      nota: checkRows[0],
      anexos: rows,
      total: rows.length
    });
    
  } catch (err) {
    console.error('Erro ao listar anexos:', err);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
      details: err.message
    });
  }
});

// Listar todos os anexos (usuários autenticados)
router.get('/', requireAuth, async (req, res) => {
  const { tipo, limite = 50, offset = 0 } = req.query;
  
  try {
    let query = `
      SELECT 
        a.id,
        a.id_nota,
        a.tipo,
        a.nome_arquivo,
        a.url_cloudinary,
        a.data_upload,
        a.usuario_upload,
        CASE 
          WHEN a.tipo = 'NC' THEN nc.numero
          WHEN a.tipo = 'NE' THEN ne.numero
        END as numero_nota
      FROM anexos a
      LEFT JOIN nota_credito nc ON a.tipo = 'NC' AND a.id_nota = nc.id
      LEFT JOIN nota_empenhos ne ON a.tipo = 'NE' AND a.id_nota = ne.id
      WHERE a.ativo = true
    `;
    
    const params = [];
    
    // Filtrar por tipo se especificado
    if (tipo && ['NC', 'NE'].includes(tipo.toUpperCase())) {
      query += ' AND a.tipo = $1';
      params.push(tipo.toUpperCase());
    }
    
    query += ` ORDER BY a.data_upload DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limite), parseInt(offset));
    
    const { rows } = await pool.query(query, params);
    
    // Contar total de anexos
    let countQuery = 'SELECT COUNT(*) as total FROM anexos WHERE ativo = true';
    const countParams = [];
    
    if (tipo && ['NC', 'NE'].includes(tipo.toUpperCase())) {
      countQuery += ' AND tipo = $1';
      countParams.push(tipo.toUpperCase());
    }
    
    const { rows: countRows } = await pool.query(countQuery, countParams);
    
    res.json({
      anexos: rows,
      pagination: {
        total: parseInt(countRows[0].total),
        limite: parseInt(limite),
        offset: parseInt(offset),
        hasNext: parseInt(offset) + parseInt(limite) < parseInt(countRows[0].total)
      }
    });
    
  } catch (err) {
    console.error('Erro ao listar todos os anexos:', err);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
      details: err.message
    });
  }
});

// Excluir anexo (somente admin) - soft delete
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  if (isNaN(parseInt(id))) {
    return res.status(400).json({
      error: 'ID do anexo deve ser um número válido',
      code: 'INVALID_ATTACHMENT_ID'
    });
  }
  
  try {
    // Verificar se o anexo existe
    const { rows: checkRows } = await pool.query(
      'SELECT id, nome_arquivo FROM anexos WHERE id = $1 AND ativo = true',
      [id]
    );
    
    if (checkRows.length === 0) {
      return res.status(404).json({
        error: 'Anexo não encontrado',
        code: 'ATTACHMENT_NOT_FOUND'
      });
    }
    
    // Soft delete - marcar como inativo
    const { rows } = await pool.query(
      'UPDATE anexos SET ativo = false WHERE id = $1 RETURNING *',
      [id]
    );
    
    res.json({
      message: 'Anexo excluído com sucesso',
      anexo: rows[0]
    });
    
  } catch (err) {
    console.error('Erro ao excluir anexo:', err);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
      details: err.message
    });
  }
});

export default router;