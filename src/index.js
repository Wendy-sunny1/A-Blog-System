const { initializeDatabase } = require('./db/database');
const { startExpress } = require('./server');

const VERSION = '1.0.0';

async function startServer() {
    console.log('-'.repeat(30));
    console.log(`Starting Server v${VERSION}`);
    await initializeDatabase();
    await startExpress();
}

startServer();
