const app = require('./app');
const config = require('./config/config');
const { log } = require('./utils/utils');
const { prisma } = require('./lib/prismaClient');

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  log.info(`🚀 Server running on http://localhost:${PORT}`);
  log.info('NODE_ENV =' + config.ENV);
});

process.on('SIGTERM', async () => {
  shutdown('SIGTERM');
});

process.on('SIGINT', async () => {
  shutdown('SIGINT');
});

async function shutdown(signal) {
  log.info('🛑 ' + signal + ' received. Closing server...');
  await prisma.$disconnect();
  server.close(() => {
    log.info('Server closed.');
    process.exit(0);
  });
}
