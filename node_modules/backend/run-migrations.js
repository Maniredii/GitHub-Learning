require('dotenv').config();
const knex = require('knex');
const path = require('path');

const config = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'gitquest',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  },
  migrations: {
    directory: path.join(__dirname, 'src/database/migrations'),
    extension: 'ts',
    loadExtensions: ['.ts'],
  },
};

// Register tsx to handle TypeScript
require('tsx/cjs');

const db = knex(config);

db.migrate
  .latest()
  .then(() => {
    console.log('✅ Migrations completed successfully!');
    return db.destroy();
  })
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
