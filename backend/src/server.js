import app from './app.js';
import { env } from './config/env.js';
import { pool, closePool } from './config/db.js';

const server = app.listen(env.port, () => {
  console.log(`Backend running on http://localhost:${env.port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', async (error) => {
  console.error('Uncaught exception:', error);
  await pool.end();
  process.exit(1);
});
