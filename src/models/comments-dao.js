const SQL = require('sql-template-strings');
const { getDatabase } = require('../db/database.js');

async function searchCommentsByArticleID(articleID) {
    const db = await getDatabase();

    const commentList = await db.all(SQL`
    SELECT u.username, c.id, c.articleID, a.title, c.replyToCommentID, c.texts, c.commentTime
    FROM comments c
    LEFT JOIN users u ON c.userID = u.id
    LEFT JOIN articles a on c.articleID = a.id
    WHERE c.articleID = ${articleID}
    ORDER BY c.articleID, c.replyToCommentID, c.commentTime;`);

    return commentList;
}

async function insertSingleComment(comment) {
    const db = await getDatabase();

    const result = await db.run(SQL`
    INSERT INTO 
    comments (texts, commentTime, replyToCommentID, isHidden, userID, articleID) 
    VALUES (
        ${comment.content}, 
        ${comment.timestamp}, 
        ${comment.replyToCommentID}, 
        ${comment.isHidden}, 
        ${comment.userID}, 
        ${comment.articleID}
    )`);
}

async function deleteCommentBycommentID(commentID) {
    const db = await getDatabase();

    const result = await db.run(SQL`
    DELETE FROM
    comments 
    WHERE id = ${commentID}`);
}

async function updateCommentBycommentID(commentID) {
    const db = await getDatabase();

    const result = await db.run(SQL`
    UPDATE comments
    SET texts = 'This comment has been removed.', commentTime = ''
    WHERE id = ${commentID}`);
}

async function numberOfCommentsByUserIDAndDate(articleID, startDate, endDate) {
    const db = await getDatabase();

    const numberOfComments = await db.all(SQL`
    SELECT COALESCE(COUNT(*), 0) as count 
    FROM comments
    WHERE articleID = ${articleID} AND commentTime >= ${startDate} AND  commentTime <= ${endDate}`);

    return numberOfComments;
}

module.exports = {
    searchCommentsByArticleID,
    insertSingleComment,
    deleteCommentBycommentID,
    updateCommentBycommentID,
    numberOfCommentsByUserIDAndDate,
};
