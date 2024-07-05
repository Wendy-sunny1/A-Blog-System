const SQL = require('sql-template-strings');
const { getDatabase } = require('../db/database.js');

async function getAllUserdetails() {
    const db = await getDatabase();

    const allAllUserdetails = await db.all(SQL`select * from users`);

    return allAllUserdetails;
}

module.exports = {
    getAllUserdetails,
};