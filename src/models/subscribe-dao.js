const SQL = require("sql-template-strings");
// const dbPromise = require("../db/database.js");
const { getDatabase } = require('../db/database.js');

async function addNewSubscriber(subscriberID, authorID){
    const db = await getDatabase();

    await db.run(SQL`
        INSERT INTO subscribe
        VALUES(${subscriberID}, ${authorID})`);
}

async function deleteSubscriber(subscriberID, authorID){
    const db = await getDatabase();
    await db.run(SQL`
        DELETE FROM subscribe
        WHERE subscriberID = ${subscriberID} AND authorID = ${authorID}`);
}

async function retriveMyAuthorsNamesByMyID(subscriberID){
    const db = await getDatabase();
    const authorNamesArray = await db.all(SQL`
    SELECT * FROM users u, subscribe s WHERE s.subscriberID = ${subscriberID} AND s.authorID = u.ID;`);

    return authorNamesArray;
}

async function retriveMySubscribersNamesByMyID(authorID){
    const db = await getDatabase();
    const subscriberNamesArray = await db.all(SQL`
    SELECT * FROM users u, subscribe s WHERE s.authorID = ${authorID} AND s.subscriberID = u.ID;`);

    return subscriberNamesArray;
}

async function getNotificationNumber(noticeReceiverID){
    const db = await getDatabase();
    const notificationNumber = await db.get(SQL`
    SELECT COUNT(*) AS notificationNumber FROM notification 
    WHERE noticeReceiverID = ${noticeReceiverID} AND isClicked = false`);
    return notificationNumber;
}

async function retriveUserIDByUsername(username){
    const db = await getDatabase();
    const userID = await db.get(SQL`
    SELECT id FROM users WHERE username = ${username};`);

    return userID;
}

async function retriveUsernameByUserID(userID){
    const db = await getDatabase();
    const userName = await db.get(SQL`
    SELECT username FROM users WHERE id = ${userID};`);

    return userName;
}

async function getSubscribeStatus(subscriberID, authorID){
    const db = await getDatabase();
    const subscribed = await db.all(
        SQL`SELECT * FROM subscribe WHERE subscriberID = ${subscriberID} AND authorID = ${authorID}`);

    if (subscribed && subscribed.length > 0) {
        return true;
    }
    return false;
}

async function getNotificationSubscriberList(userID){
    const db = await getDatabase();
    const notificationSubscriberList = await db.all(SQL`
    SELECT * FROM subscribe s, notificate n WHERE s.authorID = ${userID} AND n.userID = ${userID}`);
    return notificationSubscriberList;
}

async function getNotificationArticleList(userID){
    const db = await getDatabase();
    const notificationArticleList = await db.all(SQL`
    SELECT subscriberID FROM subscribe WHERE authorID = ${userID}`);

    return notificationArticleList;
}

async function retriveArticleNoticeContent(noticeReceiverID){
    const db = await getDatabase();
    const articleNoticeContent = await db.all(SQL`
    SELECT content 
    FROM notification 
    WHERE noticeReceiverID = ${noticeReceiverID} 
    AND isClicked = false `);

    return articleNoticeContent;
}

async function retriveMyAuthorComments(userID){
    const db = await getDatabase();
    const myAuthorsComments = await db.all(SQL`
    SELECT * FROM comments c, subscribe s, users u WHERE s.subscriberID = ${userID} AND c.userID = s.authorID AND u.id = c.userID`);

    return myAuthorsComments;
}

async function initNotificateTable(content, currentUserID, noticeReceiverID){
    const db = await getDatabase();
    const result = await db.run(SQL`
        INSERT INTO notification (content, currentUserID, noticeReceiverID, isClicked)
        VALUES (${content}, ${currentUserID}, ${noticeReceiverID}, false)`);
    return result.lastID;
}

async function updateClickedStatus(notificationID){
    const db = await getDatabase();
    await db.run(SQL`update notification set isClicked = true where notificateID = ${notificationID}`);
}

async function retrieveClickedStatus(notificationID){
    const db = await getDatabase();
    const clickedStatus = await db.get(SQL`SELECT isClicked FROM notification WHERE notificateID = ${notificationID}`);
    return clickedStatus;
}
 
async function retrieveUsernameByID(userID){
    const db = await getDatabase();
    const username = await db.get(SQL`SELECT username FROM users WHERE id = ${userID}`);
    return username;
}

async function retrieveNotificationList(noticeReceiverID){
    const db = await getDatabase();
    const notificationList = await db.all(SQL`SELECT notificateID, content FROM notification 
    WHERE noticeReceiverID = ${noticeReceiverID} AND isClicked = false
    ORDER BY notificateID DESC`);
    return notificationList;
}

async function retrieveAvataridByUsername(username){
    const db = await getDatabase();
    const avatarid = await db.get(SQL`SELECT avatarid FROM users 
    WHERE username = ${username}`);

    return avatarid.avatarid;
}

async function retriveAllUsers(){
    const db = await getDatabase();
    const users = await db.all(SQL`SELECT * FROM users`);

    return users;
}
module.exports = {
   addNewSubscriber,
   deleteSubscriber,
   retriveMyAuthorsNamesByMyID,
   retriveMySubscribersNamesByMyID,
   getNotificationNumber,
   retriveUserIDByUsername,
   retriveUsernameByUserID,
   getSubscribeStatus,
   getNotificationSubscriberList,
   getNotificationArticleList,
   retriveArticleNoticeContent,
   retriveMyAuthorComments,
   initNotificateTable,
   updateClickedStatus,
   retrieveClickedStatus,
   retrieveUsernameByID,
   retrieveNotificationList,
   retrieveAvataridByUsername,
   retriveAllUsers
  };
  