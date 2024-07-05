const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const fs = require('fs');

// The name of the sqlite file
// It is safe to change this if we wish to use a new database
const DATABASE_FILENAME = 'project-database.db';
const INIT_SCRIPT = 'sql/blog-database-init-script.sql';

/**
 * @type {null | sqlite.Database}
 */
let dbInstance = null;

/**
 * Creates database if it does not exist
 */
async function initializeDatabase() {
    const db = await sqlite.open({
        filename: DATABASE_FILENAME,
        driver: sqlite3.Database,
    });

    // enable foreign keys just incase
    await db.run('pragma foreign_keys=true');

    // create tables
    // todo: design a way to check if sql tables need to created
    if (fs.existsSync(INIT_SCRIPT)) {
        console.log(`creating new database with INIT_SCRIPT: ${INIT_SCRIPT}`);
        const initSQLText = fs.readFileSync(INIT_SCRIPT, 'utf-8');
        await db.exec(initSQLText);
    }

    // store database instance
    dbInstance = db;

    return db;
}

/**
 * returns db promise
 * @returns {sqlite.Database}
 */
async function getDatabase() {
    if (dbInstance != null) {
        return dbInstance;
    }

    return initializeDatabase();
}

module.exports = {
    initializeDatabase,
    getDatabase,
};
