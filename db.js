const { Pool } = require('pg');

const pool = new Pool({
  user: 'SEU_USUARIO',
  host: 'SEU_HOST_NEONDB',
  database: 'NOME_DO_BANCO',
  password: 'SUA_SENHA',
  port: 5432,
  ssl: true
});

module.exports = pool;