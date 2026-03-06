module.exports = (client) => {
  process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Rejection:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
  });

  client.on('error', (error) => {
    console.error('❌ Client Error:', error);
  });

  client.on('warn', (info) => {
    console.warn('⚠️  Client Warning:', info);
  });
};
