import db from './db';

async function runMigrations() {
  try {
    console.log('Running migrations...');
    
    await db.migrate.latest();
    
    console.log('✅ Migrations completed successfully');
    
    // Close the database connection
    await db.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await db.destroy();
    process.exit(1);
  }
}

runMigrations();
