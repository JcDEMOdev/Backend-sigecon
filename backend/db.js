// Configuração do banco de dados - NeonDB/PostgreSQL
import dotenv from 'dotenv';
dotenv.config();
import pkg from 'pg';
const { Pool } = pkg;

// Configuração da conexão com NeonDB usando a mesma configuração do server.js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_8cDPnmrpoJ4B@ep-crimson-mode-aejyyt5m-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false, require: true }
});

// Teste de conexão
pool.on('connect', () => {
  console.log('Conectado ao banco de dados NeonDB');
});

pool.on('error', (err) => {
  console.error('Erro na conexão com o banco de dados:', err);
});

export default pool;