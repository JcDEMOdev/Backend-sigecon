// SIGECON Anexos Routes - Gestão de Arquivos para NC/NE
// Rotas para anexar e listar arquivos de NC/NE com controle de acesso

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from '../db.js';
import { requireAuth, requirePermission, auditLog } from '../middlewares/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do diretório de uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Gera nome único: timestamp_userId_originalname
    const uniqueName = `${Date.now()}_${req.session.userId}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

// Filtros de arquivo e validações
const fileFilter = (req, file, cb) => {
  // Tipos de arquivo permitidos
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Permitidos: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, TXT'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
    files: 5 // máximo 5 arquivos por upload
  }
});

// ================== ROTAS DE ANEXOS ==================

// Listar anexos de uma NC
router.get('/nc/:nc_id', requireAuth, async (req, res) => {
  const { nc_id } = req.params;
  
  try {
    // Verifica se a NC existe e se o usuário tem acesso
    const ncCheck = await pool.query(
      'SELECT id FROM nota_credito WHERE id = $1',
      [nc_id]
    );

    if (ncCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Nota de Crédito não encontrada.',
        code: 'NC_NOT_FOUND'
      });
    }

    // Busca anexos da NC
    const { rows } = await pool.query(
      `SELECT a.*, u.username as uploaded_by_name 
       FROM anexos a 
       LEFT JOIN users u ON a.uploaded_by = u.id 
       WHERE a.entity_type = 'NC' AND a.entity_id = $1 
       ORDER BY a.created_at DESC`,
      [nc_id]
    );

    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar anexos da NC:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor.',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Listar anexos de uma NE
router.get('/ne/:ne_id', requireAuth, async (req, res) => {
  const { ne_id } = req.params;
  
  try {
    // Verifica se a NE existe e se o usuário tem acesso
    const neCheck = await pool.query(
      'SELECT id FROM nota_empenhos WHERE id = $1',
      [ne_id]
    );

    if (neCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Nota de Empenho não encontrada.',
        code: 'NE_NOT_FOUND'
      });
    }

    // Busca anexos da NE
    const { rows } = await pool.query(
      `SELECT a.*, u.username as uploaded_by_name 
       FROM anexos a 
       LEFT JOIN users u ON a.uploaded_by = u.id 
       WHERE a.entity_type = 'NE' AND a.entity_id = $1 
       ORDER BY a.created_at DESC`,
      [ne_id]
    );

    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar anexos da NE:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor.',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Upload de anexo para NC
router.post('/nc/:nc_id/upload', 
  requireAuth, 
  requirePermission('anexos_create'),
  auditLog('anexo_upload_nc'),
  upload.array('files', 5), 
  async (req, res) => {
    const { nc_id } = req.params;
    const { description } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        error: 'Nenhum arquivo foi enviado.',
        code: 'NO_FILES'
      });
    }

    try {
      // Verifica se a NC existe
      const ncCheck = await pool.query(
        'SELECT id FROM nota_credito WHERE id = $1',
        [nc_id]
      );

      if (ncCheck.rows.length === 0) {
        // Remove arquivos já salvos se NC não existe
        req.files.forEach(file => {
          fs.unlinkSync(file.path);
        });
        
        return res.status(404).json({ 
          error: 'Nota de Crédito não encontrada.',
          code: 'NC_NOT_FOUND'
        });
      }

      // Salva informações dos anexos no banco
      const savedFiles = [];
      
      for (const file of req.files) {
        const { rows } = await pool.query(
          `INSERT INTO anexos (entity_type, entity_id, filename, original_name, 
           file_path, file_size, mime_type, description, uploaded_by, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) 
           RETURNING *`,
          ['NC', nc_id, file.filename, file.originalname, file.path, 
           file.size, file.mimetype, description || '', req.session.userId]
        );
        
        savedFiles.push(rows[0]);
      }

      res.status(201).json({
        message: 'Arquivos enviados com sucesso.',
        files: savedFiles
      });

    } catch (error) {
      console.error('Erro ao salvar anexos:', error);
      
      // Remove arquivos em caso de erro
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.error('Erro ao remover arquivo:', unlinkError);
        }
      });

      res.status(500).json({ 
        error: 'Erro interno do servidor.',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

// Upload de anexo para NE
router.post('/ne/:ne_id/upload', 
  requireAuth, 
  requirePermission('anexos_create'),
  auditLog('anexo_upload_ne'),
  upload.array('files', 5), 
  async (req, res) => {
    const { ne_id } = req.params;
    const { description } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        error: 'Nenhum arquivo foi enviado.',
        code: 'NO_FILES'
      });
    }

    try {
      // Verifica se a NE existe
      const neCheck = await pool.query(
        'SELECT id FROM nota_empenhos WHERE id = $1',
        [ne_id]
      );

      if (neCheck.rows.length === 0) {
        // Remove arquivos já salvos se NE não existe
        req.files.forEach(file => {
          fs.unlinkSync(file.path);
        });
        
        return res.status(404).json({ 
          error: 'Nota de Empenho não encontrada.',
          code: 'NE_NOT_FOUND'
        });
      }

      // Salva informações dos anexos no banco
      const savedFiles = [];
      
      for (const file of req.files) {
        const { rows } = await pool.query(
          `INSERT INTO anexos (entity_type, entity_id, filename, original_name, 
           file_path, file_size, mime_type, description, uploaded_by, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) 
           RETURNING *`,
          ['NE', ne_id, file.filename, file.originalname, file.path, 
           file.size, file.mimetype, description || '', req.session.userId]
        );
        
        savedFiles.push(rows[0]);
      }

      res.status(201).json({
        message: 'Arquivos enviados com sucesso.',
        files: savedFiles
      });

    } catch (error) {
      console.error('Erro ao salvar anexos:', error);
      
      // Remove arquivos em caso de erro
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.error('Erro ao remover arquivo:', unlinkError);
        }
      });

      res.status(500).json({ 
        error: 'Erro interno do servidor.',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

// Download de anexo
router.get('/download/:anexo_id', requireAuth, async (req, res) => {
  const { anexo_id } = req.params;
  
  try {
    const { rows } = await pool.query(
      'SELECT * FROM anexos WHERE id = $1',
      [anexo_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        error: 'Anexo não encontrado.',
        code: 'ANEXO_NOT_FOUND'
      });
    }

    const anexo = rows[0];
    
    // Verifica se o arquivo ainda existe no sistema
    if (!fs.existsSync(anexo.file_path)) {
      return res.status(404).json({ 
        error: 'Arquivo não encontrado no sistema.',
        code: 'FILE_NOT_FOUND'
      });
    }

    // Configura headers para download
    res.setHeader('Content-Disposition', `attachment; filename="${anexo.original_name}"`);
    res.setHeader('Content-Type', anexo.mime_type);
    
    // Stream do arquivo
    const fileStream = fs.createReadStream(anexo.file_path);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Erro ao fazer download do anexo:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor.',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Excluir anexo
router.delete('/:anexo_id', 
  requireAuth, 
  requirePermission('anexos_delete'),
  auditLog('anexo_delete'),
  async (req, res) => {
    const { anexo_id } = req.params;
    
    try {
      const { rows } = await pool.query(
        'SELECT * FROM anexos WHERE id = $1',
        [anexo_id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ 
          error: 'Anexo não encontrado.',
          code: 'ANEXO_NOT_FOUND'
        });
      }

      const anexo = rows[0];

      // Remove registro do banco
      await pool.query('DELETE FROM anexos WHERE id = $1', [anexo_id]);

      // Remove arquivo do sistema (se existir)
      if (fs.existsSync(anexo.file_path)) {
        try {
          fs.unlinkSync(anexo.file_path);
        } catch (unlinkError) {
          console.error('Erro ao remover arquivo do sistema:', unlinkError);
        }
      }

      res.json({ 
        message: 'Anexo excluído com sucesso.',
        anexo_id: anexo_id
      });

    } catch (error) {
      console.error('Erro ao excluir anexo:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor.',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

// Atualizar descrição de anexo
router.put('/:anexo_id', 
  requireAuth, 
  requirePermission('anexos_edit'),
  auditLog('anexo_update'),
  async (req, res) => {
    const { anexo_id } = req.params;
    const { description } = req.body;
    
    try {
      const { rows } = await pool.query(
        'UPDATE anexos SET description = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [description || '', anexo_id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ 
          error: 'Anexo não encontrado.',
          code: 'ANEXO_NOT_FOUND'
        });
      }

      res.json({
        message: 'Anexo atualizado com sucesso.',
        anexo: rows[0]
      });

    } catch (error) {
      console.error('Erro ao atualizar anexo:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor.',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

export default router;