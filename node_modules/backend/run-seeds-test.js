require('dotenv').config();
const knex = require('knex');
const path = require('path');

const config = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME_TEST || 'gitquest_test',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  },
  seeds: {
    directory: path.join(__dirname, 'src/database/seeds'),
    extension: 'ts',
    loadExtensions: ['.ts'],
  },
};

// Register tsx to handle TypeScript
require('tsx/cjs');

const db = knex(config);

db.seed
  .run()
  .then(() => {
    console.log('✅ Test database seeds completed successfully!');
    return db.destroy();
  })
  .catch((err) => {
    console.error('❌ Test database seeding failed:', err);
    process.exit(1);
  });
