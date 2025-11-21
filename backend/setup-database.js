// Simple database setup script
const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Setting up database...\n');

try {
  // Run migrations using tsx
  console.log('📦 Running migrations...');
  execSync('npx tsx src/database/migrations-runner.ts', {
    cwd: path.join(__dirname),
    stdio: 'inherit'
  });
  
  console.log('\n✅ Database setup complete!');
} catch (error) {
  console.error('\n❌ Database setup failed:', error.message);
  process.exit(1);
}
