const { Pool } = require('pg');

const pool = new Pool({
  user: 'neondb_owner',
  host: 'ep-crimson-mode-aejyyt5m-pooler.c-2.us-east-2.aws.neon.tech',
  database: 'neondb',
  password: 'npg_8cDPnmrpoJ4B', // SENHA
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;