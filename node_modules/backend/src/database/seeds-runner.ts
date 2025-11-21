import db from './db';

async function runSeeds() {
  try {
    console.log('Running seeds...');
    
    await db.seed.run();
    
    console.log('✅ Seeds completed successfully');
    
    // Close the database connection
    await db.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await db.destroy();
    process.exit(1);
  }
}

runSeeds();
