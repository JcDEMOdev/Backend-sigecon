// SIGECON Database Connection - NeonDB/PostgreSQL with Pool and SSL
import pkg from 'pg';
const { Pool } = pkg;

// Configuração da conexão usando Pool para máxima eficiência
const pool = new Pool({
  // Prioriza variáveis de ambiente, fallback para credenciais explícitas
  connectionString: process.env.DATABASE_URL || 
    'postgresql://neondb_owner:npg_8cDPnmrpoJ4B@ep-crimson-mode-aejyyt5m-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require',
  
  // Configuração alternativa por componentes (se DATABASE_URL não estiver definida)
  user: process.env.DB_USER || 'neondb_owner',
  host: process.env.DB_HOST || 'ep-crimson-mode-aejyyt5m-pooler.c-2.us-east-2.aws.neon.tech',
  database: process.env.DB_NAME || 'neondb',
  password: process.env.DB_PASSWORD || 'npg_8cDPnmrpoJ4B',
  port: process.env.DB_PORT || 5432,
  
  // Configuração SSL para NeonDB - obrigatória para produção
  ssl: {
    rejectUnauthorized: false,
    require: true
  },
  
  // Configurações de Pool para máxima eficiência
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000, // tempo para fechar conexões ociosas
  connectionTimeoutMillis: 2000, // timeout para nova conexão
});

// Tratamento de eventos do pool para monitoramento
pool.on('connect', () => {
  console.log('Conexão estabelecida com NeonDB/PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Erro inesperado no cliente PostgreSQL:', err);
  process.exit(-1);
});

export default pool;