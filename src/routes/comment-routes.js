const express = require('express');
const session = require('express-session');
const router = express.Router();

const {
    checkDeletionPermission,
} = require('../middleware/comment-token-middleware.js');
const commentDao = require('../models/comments-dao.js');
const articleDao = require('../models/articles-dao.js');
const userDao = require('../models/users-dao.js');
const subscribeDao = require('../models/subscribe-dao.js');

router.use(express.json());
router.use(
    session({
        secret: 'your_secret_key',
        resave: true,
        saveUninitialized: true,
    })
);

// Router to post a new comment on the artilce page
router.post('/aritcleid=:articleID/newcomment', async function (req, res) {
    const content = req.body;
    const currentDate = new Date();

    // Format the date as YYYY-MM-DD HH:MM:SS
    const formattedCurrentDate = currentDate
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

    const newComment = {
        content: content.comment,
        timestamp: formattedCurrentDate,
        replyToCommentID: null,
        isHidden: 0,
        userID: req.session.user.id,
        articleID: parseInt(req.session.articleID, 10),
    };

    // The table 'comments' in the database requires attributes:
    // commentText, commentTime, replyToCommentID, isHidden, userID, articleID
    const result = await commentDao.insertSingleComment(newComment);

    // Insert new notification message into DB
    const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken);
    const commenterID = user.id;
    const commenterNameObj =
        await subscribeDao.retrieveUsernameByID(commenterID);
    const commenterName = commenterNameObj.username;
    const commenterSubscribers =
        await subscribeDao.retriveMySubscribersNamesByMyID(commenterID);
    const articleID = parseInt(req.session.articleID, 10);
    const articleNameObj =
        await articleDao.retrieveArticleWithArticleID(articleID);
    const articleName = articleNameObj.title;
    let notificationContent = `{notificationType: 'new_comment_notification'}, {articleID: '${articleID}'}, {articleName: '${articleName}'}, {commenterID: '${commenterID}'}, {commenterName: '${commenterName}'}, {commentTime: '${formattedCurrentDate}'}`;

    commenterSubscribers.forEach(async function (element) {
        await subscribeDao.initNotificateTable(
            notificationContent,
            commenterID,
            element.id
        );
    });

    res.redirect(`/articles/${newComment.articleID}/#post-btn`);
});

// Router to post a new comment on the artilce page
router.post('/comments/:commentID/newreply', async function (req, res) {
    const parentID = req.params.commentID;
    const { replyText } = req.body;
    const currentDate = new Date();

    // Format the date as YYYY-MM-DD HH:MM:SS
    const formattedCurrentDate = currentDate
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

    const newComment = {
        content: replyText,
        timestamp: formattedCurrentDate,
        replyToCommentID: parentID,
        isHidden: 0,
        userID: req.session.user.id,
        articleID: parseInt(req.session.articleID, 10),
    };

    // The table 'comments' in the database requires attributes:
    // commentText, commentTime, replyToCommentID, isHidden, userID, articleID
    const result = await commentDao.insertSingleComment(newComment);

    // Insert new notification message into DB
    const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken);
    const commenterID = user.id;
    const commenterNameObj =
        await subscribeDao.retrieveUsernameByID(commenterID);
    const commenterName = commenterNameObj.username;
    const commenterSubscribers =
        await subscribeDao.retriveMySubscribersNamesByMyID(commenterID);
    const articleID = parseInt(req.session.articleID, 10);
    const articleNameObj =
        await articleDao.retrieveArticleWithArticleID(articleID);
    const articleName = articleNameObj.title;
    let notificationContent = `{notificationType: 'new_comment_reply_notification'}, {articleID: '${articleID}'}, {articleName: '${articleName}'}, {commenterID: '${commenterID}'}, {commenterName: '${commenterName}'}, {commentTime: '${formattedCurrentDate}'}`;

    commenterSubscribers.forEach(async function (element) {
        await subscribeDao.initNotificateTable(
            notificationContent,
            commenterID,
            element.id
        );
    });

    res.redirect(`/articles/${newComment.articleID}/#post-btn`);
});

// Router to allow the article author or the comment owners deleting comments
router.delete(
    '/:commenter/comments/:commentID/remove',
    checkDeletionPermission,
    async function (req, res) {
        const articleID = req.session.articleID;
        const commentOwner = req.params.commenter;
        const commentID = req.params.commentID;
        const userIsArticleAuthor = res.locals.userIsArticleAuthor;

        const commenterID =
            await userDao.retrieveUserIDByUserName(commentOwner);

        let isAllowedToDelete = false;
        if (userIsArticleAuthor || commenterID == res.locals.user.id) {
            isAllowedToDelete = true;
        }

        if (isAllowedToDelete) {
            const result = await commentDao.deleteCommentBycommentID(commentID);
        }

        res.redirect(`/articles/${articleID}/#post-btn`);
    }
);

module.exports = router;
