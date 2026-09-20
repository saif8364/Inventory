const app = require('./app');
const env = require('./config/env');

app.listen(env.PORT, "0.0.0.0",() => {
  console.log(`\n  ✓ Server running on http://localhost:${env.PORT}`);
  console.log(`  ✓ API available at http://localhost:${env.PORT}/api`);
  console.log(`  ✓ Frontend at http://localhost:${env.PORT}\n`);
});
