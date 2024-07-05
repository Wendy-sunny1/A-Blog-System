const SQL = require('sql-template-strings');
const { getDatabase } = require('../db/database.js');

async function addNewLike(userID, articleID) {
    const db = await getDatabase();

    //check if the current user already liked the article
    const liked = await db.all(
        SQL`SELECT * FROM likes WHERE userID = ${userID} AND articleID = ${articleID}`
    );
    // console.log(liked);
    // console.log(typeof liked);

    //if liked before, then delete from the table, then add again
    if (typeof liked && liked.length > 0) {
        // console.log('like is true');
        await db.run(
            SQL`DELETE FROM likes WHERE userID = ${userID} AND articleID = ${articleID}`
        );
        await db.run(SQL`INSERT INTO likes VALUES (${userID}, ${articleID})`);
    } else {
        // console.log('like is false');
        await db.run(SQL`INSERT INTO likes VALUES (${userID}, ${articleID})`);

        const likeCounts = await db.get(
            SQL`SELECT likeCount FROM articles WHERE id = ${articleID}`
        );
        // console.log(likeCounts);
        const currentCounts = likeCounts.likeCount + 1;
        // console.log(currentCounts);
        await db.run(
            SQL`UPDATE articles SET likeCount = ${currentCounts} WHERE id = ${articleID}`
        );
    }
}
async function deleteLike(userID, articleID) {
    const db = await getDatabase();
    await db.run(
        SQL`DELETE FROM likes WHERE userID = ${userID} AND articleID = ${articleID}`
    );
    const likeCounts = await db.get(
        SQL`SELECT likeCount FROM articles WHERE id = ${articleID}`
    );
    // console.log(likeCounts);
    const currentCounts = likeCounts.likeCount - 1;
    console.log(currentCounts);
    await db.run(
        SQL`UPDATE articles SET likeCount = ${currentCounts} WHERE id = ${articleID}`
    );
}

async function getLikeStatus(userID, articleID) {
    const db = await getDatabase();

    //check if the current user already liked the article
    const liked = await db.all(
        SQL`SELECT * FROM likes WHERE userID = ${userID} AND articleID = ${articleID}`
    );
    // console.log(liked);
    if (liked && liked.length > 0) {
        return true;
    }
    return false;
}

module.exports = {
    addNewLike,
    getLikeStatus,
    deleteLike,
};
