const express = require('express');
const session = require('express-session');
const router = express.Router();
const fs = require('fs');

const { verifyAuthenticated } = require('../middleware/auth-middleware.js');

const userDao = require('../models/users-dao.js');
const articleDao = require('../models/articles-dao.js');
const subscribeDao = require('../models/subscribe-dao.js');
const likesDao = require('../models/like-dao.js');
const commentDao = require('../models/comments-dao.js');
const settingDao = require('../models/setting-dao.js');
const { log } = require('console');

router.use(
    session({
        secret: 'your_secret_key',
        resave: true,
        saveUninitialized: true,
    })
);

function processArticleContent(content) {
    var regex = /<h1>[\s\S]*?<\/h1>/gi;
    var result = content.replace(regex, '');

    return result;
}

function processArticleContentSecond(content) {
    return content.length < 200
        ? content
        : content.substring(0, 200) + ' ......';
}

router.get('/', async function (req, res) {
    let articles = await articleDao.retrieveAllArticles();

    const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken);

    for (let eachArticle of articles) {
        let userID = eachArticle.userID;
        eachArticle.username = await userDao.retrieveUserNameWithUserID(userID);
        eachArticle.userAvatarID =
            await userDao.retrieveUserAvatarIDwithUserID(userID);
        eachArticle.content = processArticleContent(eachArticle.content);
        eachArticle.content = processArticleContentSecond(eachArticle.content);
    }

    res.locals.allArticles = articles;

    if(user){
        const number = await subscribeDao.getNotificationNumber(user.id);
        res.locals.number = number.notificationNumber;
    }else{
    res.locals.number = null;
    }

    res.render('home');
});

//check if current user already liked the article, if liked, => unlike, if unlike => liked
router.post('/like', async function (req, res) {
    const { userID, articleID } = req.body;

    const likeStatus = await likesDao.getLikeStatus(userID, articleID);
    if (!likeStatus) {
        await likesDao.addNewLike(userID, articleID);
    } else {
        await likesDao.deleteLike(userID, articleID);
    }
    res.redirect(`/articles/${articleID}`);
});

router.post('/author/addNewSubscriber', async function (req, res) {
    const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken);
    const subscriberID = user.id;
    const authorID = req.body.userID;
    const authorName = await subscribeDao.retriveUsernameByUserID(authorID);
    const subscribeStatus = await subscribeDao.getSubscribeStatus(
        subscriberID,
        authorID
    );
    if (!subscribeStatus) {
        await subscribeDao.addNewSubscriber(subscriberID, authorID);
        //insert a new row to notification
        let content = `{notificationType: 'new_subscription_notification'}, {subscriberID: '${subscriberID}'}, {authorID: '${authorID}'}, {subscriberName: '${user.username}'}`;
        await subscribeDao.initNotificateTable(content, subscriberID, authorID);
    } else {
        await subscribeDao.deleteSubscriber(subscriberID, authorID);
    }

    res.redirect(`/author/${authorName.username}`);
});

////////////////////////////////////////////////////////////////////
// when a logged in user clicked on the first link, nav to show a list
// of all articles
router.get('/allArticles', async function (req, res) {
    res.locals.allArticles = await articleDao.retrieveAllArticles();
    res.render('allArticles');
});

// router.post('/deleteSubscriber', async function (req, res) {
//     const subscriberID = req.body.userID;
//     const authorID = 1;
//     await subscribeDao.deleteSubscriber(subscriberID, authorID);
//     res.render('home');
// });

//unsubscribe on user's "authors" list
router.post('/deleteMyAuthor', async function (req, res) {
    const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken);
    const subscriberID = user.id;

    const authorID = req.body.userID;

    await subscribeDao.deleteSubscriber(subscriberID, authorID);
    const authorNamesArray =
        await subscribeDao.retriveMyAuthorsNamesByMyID(subscriberID);
    res.locals.authorNamesArray = authorNamesArray;
    res.render('authorsAdmin');
});

router.post('/deleteMySubscriber', async function (req, res) {
    const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken);
    const authorID = user.id;
    const subscriberID = req.body.userID;

    await subscribeDao.deleteSubscriber(subscriberID, authorID);
    const subscriberNamesArray =
        await subscribeDao.retriveMySubscribersNamesByMyID(authorID);
    res.locals.subscriberNamesArray = subscriberNamesArray;
    res.render('subscribersAdmin');
});

router.post('/retriveMyAuthorsNamesByMyID', async function (req, res) {
    const subscriberID = req.body.userID;
    const authorNamesArray =
        await subscribeDao.retriveMyAuthorsNamesByMyID(subscriberID);
    res.locals.authorNamesArray = authorNamesArray;
    res.render('authorsAdmin');
});

router.get('/retriveMyAuthorsNamesByMyID', async function (req, res) {
    const subscriberID = req.body.userID;
    const authorNamesArray =
        await subscribeDao.retriveMyAuthorsNamesByMyID(subscriberID);
    res.locals.authorNamesArray = authorNamesArray;
    res.render('authorsAdmin');
});

router.post('/author/retriveMyAuthorsNamesByMyID', async function (req, res) {
    const subscriberID = req.body.userID;
    const authorNamesArray =
        await subscribeDao.retriveMyAuthorsNamesByMyID(subscriberID);
    res.locals.authorNamesArray = authorNamesArray;
    res.render('authors');
});

router.post('/retriveMySubscribersNamesByMyID', async function (req, res) {
    const authorID = req.body.userID;
    const subscriberNamesArray =
        await subscribeDao.retriveMySubscribersNamesByMyID(authorID);
    res.locals.subscriberNamesArray = subscriberNamesArray;
    res.render('subscribersAdmin');
});

router.post(
    '/author/retriveMySubscribersNamesByMyID',
    async function (req, res) {
        const authorID = req.body.userID;
        const subscriberNamesArray =
            await subscribeDao.retriveMySubscribersNamesByMyID(authorID);
        res.locals.subscriberNamesArray = subscriberNamesArray;
        res.render('subscribers');
    }
);

router.get('/fetchUserHomePage', async function (req, res) {
    res.redirect(`/author/${authorName.username}`);
});

// when user typed in "search term" in the text box at "allArticles"
// handlebar, the corresponding event listener forward that query to
// this route handler:
router.post('/searchAndSortArticles', async function (req, res) {
    const searchTerm = req.body.searchTerm;
    const selection = req.body.userSelection;

    let articles = await articleDao.retrieveArticlesWithSearchAndSort(
        searchTerm,
        selection
    );

    for (let eachArticle of articles) {
        eachArticle.content = processArticleContent(eachArticle.content);
        eachArticle.content = processArticleContentSecond(eachArticle.content);
    }

    res.locals.allArticles = articles;

    res.render('home');
});

//////////////////////////////////////////////////////////////////////
// when a logged in user clicked on the second link, nav to show a list
// of their own articles
router.get('/getCurrentUserArticles', async function (req, res) {
    const uid = res.locals.user.id;
    res.locals.uid = uid;
    res.locals.allArticles = await articleDao.retrieveArticlesWithUID(uid);

    res.render('allArticles-CurrentUser');
});

// when user typed in "search term" in the text box at "allArticles-CurrentUser"
// handlebar, the corresponding event listener forward that query to
// this route handler:
router.post('/searchAndSortArticlesForCurrentUser', async function (req, res) {
    const searchTerm = req.body.searchTerm;
    const selection = req.body.userSelection;

    let articles = await articleDao.retrieveArticlesWithSearchAndSortForUID(
        res.locals.user.id,
        searchTerm,
        selection
    );

    let currentUserAllArticles = await articleDao.retrieveArticlesWithUserName(
        res.locals.user.username
    );
    //No. of articles
    const articleNo = currentUserAllArticles.length;
    //No. of followers
    const subscribers = await subscribeDao.retriveMySubscribersNamesByMyID(
        res.locals.user.id
    );
    const numberOfSubcribers = subscribers.length;
    //No. of followings
    const authors = await subscribeDao.retriveMyAuthorsNamesByMyID(
        res.locals.user.id
    );
    const numberOfauthors = authors.length;

    for (let eachArticle of articles) {
        eachArticle.content = processArticleContent(eachArticle.content);
        eachArticle.content = processArticleContentSecond(eachArticle.content);
    }
    res.locals.allArticles = articles;
    res.locals.articleNo = articleNo;
    res.locals.numberOfSubcribers = numberOfSubcribers;
    res.locals.numberOfauthors = numberOfauthors;

    // const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken);
    const number = await subscribeDao.getNotificationNumber(res.locals.user.id);
    res.locals.number = number.notificationNumber;

    res.render('user');
});

// Sherry's view other author's acc homepage implementation
router.get('/author/:username', async function (req, res) {
    const username = req.params.username;
    const userID = await subscribeDao.retriveUserIDByUsername(username);
    const id = userID.id;
    const description = await userDao.retrieveUserDescriptionwithUserID(id);
    const avatarID = await userDao.retrieveUserAvatarIDwithUserID(id);
    res.locals.description = description;
    res.locals.avatarID = avatarID;
    res.locals.userID = id;
    res.locals.username = username;
    const authorArticles =
        await articleDao.retrieveArticlesWithUserName(username);
    //
    for (let eachArticle of authorArticles) {
        eachArticle.content = processArticleContent(eachArticle.content);
    }
    res.locals.authorArticles = authorArticles;
    res.locals.authorArticleNo = authorArticles.length;

    const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken);
    res.locals.user = user;

    const subscriberID = user.id;
    res.locals.subscribeStatus = await subscribeDao.getSubscribeStatus(
        subscriberID,
        id
    );

    //to show limited article content
    const Handlebars = require('handlebars');
    Handlebars.registerHelper('truncateText', function (text, length) {
        if (text && text.length > length) {
            return new Handlebars.SafeString(text.substring(0, length) + '...');
        } else {
            return text;
        }
    });

    //No. of followers
    const subscribers = await subscribeDao.retriveMySubscribersNamesByMyID(id);
    res.locals.numberOfSubcribers = subscribers.length;

    //No. of followings
    const authors = await subscribeDao.retriveMyAuthorsNamesByMyID(id);

    res.locals.numberOfauthors = authors.length;

    const number = await subscribeDao.getNotificationNumber(user.id);
    res.locals.number = number.notificationNumber;

    res.render('authorPage');
});

router.post('/author/:username', async function (req, res) {
    const username = req.params.username;
    const userID = await subscribeDao.retriveUserIDByUsername(username);
    const id = userID.id;
    res.locals.userID = id;
    res.locals.username = username;
    res.locals.authorArticles =
        await articleDao.retrieveArticlesWithUserName(username);

    const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken);

    const subscriberID = user.id;
    res.locals.subscribeStatus = await subscribeDao.getSubscribeStatus(
        subscriberID,
        id
    );

    const number = await subscribeDao.getNotificationNumber(user.id);
    res.locals.number = number.notificationNumber;
    res.render('authorPage');
});

router.get('/author/author/:username', async function (req, res) {
    const username = req.params.username;

    const userID = await subscribeDao.retriveUserIDByUsername(username);
    const id = userID.id;

    res.locals.userID = id;
    res.locals.username = username;
    res.locals.authorArticles =
        await articleDao.retrieveArticlesWithUserName(username);

    const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken);

    const subscriberID = user.id;
    res.locals.subscribeStatus = await subscribeDao.getSubscribeStatus(
        subscriberID,
        id
    );

    const number = await subscribeDao.getNotificationNumber(user.id);
    res.locals.number = number.notificationNumber;
    res.render('authorPage');
});

// Transform a comment list into a map which reveals the relation between replies and comments
function transformComments(
    commentList,
    currentBlogger,
    currentAavatar,
    isArticleAuthor
) {
    const commentsMap = new Map();

    // Create a map to easily access comments by ID
    commentList.forEach((comment) => {
        comment.replies = [];
        commentsMap.set(comment.id, comment);
    });

    const result = [];

    // Iterate over the comments and nest replies appropriately
    commentList.forEach((comment) => {
        let isAllowedToDelete = false;
        if (comment.replyToCommentID === null) {
            if (comment.username == currentBlogger || isArticleAuthor) {
                isAllowedToDelete = true;
            }
            result.push({
                currentBlogger: currentBlogger,
                currentAavatar: currentAavatar,
                userIsAllowedToDelete: isAllowedToDelete,
                parent: comment,
                replies: [],
            });
        } else {
            const parentComment = commentsMap.get(comment.replyToCommentID);
            if (parentComment) {
                if (
                    parentComment.username == currentBlogger ||
                    isArticleAuthor
                ) {
                    isAllowedToDelete = true;
                }
                parentComment.replies.push({
                    currentBlogger: currentBlogger,
                    currentAavatar: currentAavatar,
                    userIsAllowedToDelete: isAllowedToDelete,
                    parent: comment,
                    replies: [],
                });
            }
        }
    });

    // Filter out comments without a parent (top-level comments)
    const filteredResult = result.filter(
        (comment) => comment.parent.replyToCommentID === null
    );

    return filteredResult;
}


// router to render a particular article given an article ID
router.get('/articles/:articleID', async function (req, res) {
    const articleID = req.params.articleID;
    const article = await articleDao.retrieveArticleWithArticleID(articleID);
    const userID = article.userID;
    const user = res.locals.user;
    res.locals.username = await userDao.retrieveUserNameWithUserID(userID);
    res.locals.articleContent = processArticleContent(article.content);
    res.locals.article = article;
    res.locals.likeStatus = await likesDao.getLikeStatus(user.id, articleID);
    req.session.articleID = articleID;
    res.locals.articleID = articleID;
    req.session.user = user;

    const currentBlogger = user.username;
    const currentUserAavatar = user.avatarFileName;

    let isArticleAuthor = false;
    const aurthor = await articleDao.getAuthorIdByArticleId(articleID);

    
    if (user.id === aurthor.userID) {
        isArticleAuthor = true;
    }

    const allComments = await commentDao.searchCommentsByArticleID(articleID);


    res.locals.avatarName = currentUserAavatar;
    res.locals.commentsToThisArticle = transformComments(
        allComments,
        currentBlogger,
        currentUserAavatar,
        isArticleAuthor
    );

    const notificationID = req.body.userID;
    await subscribeDao.updateClickedStatus(notificationID);

    const number = await subscribeDao.getNotificationNumber(user.id);
    res.locals.number = number.notificationNumber;
    res.render('singleArticle');
});

//router for user to see his/her own particular article on his/her own homepage
router.get('/author/articles/:articleID', async function (req, res) {
    const articleID = req.params.articleID;
    const redirectURL = `/articles/${articleID}`;
    res.redirect(redirectURL);
});

// router for a user (also author) to see his/her own particular
// article given the articleID
router.get('/articles/own/:articleID', async function (req, res) {
    const articleID = req.params.articleID;
    res.locals.article =
        await articleDao.retrieveArticleWithArticleID(articleID);
    res.render('singleArticleForOwner');
});

// router for a user (also the author) to delete a particular article
// given the articleID
router.get('/deleteArticle/:articleID', async function (req, res) {
    const articleID = req.params.articleID;
    await articleDao.deleteArticleWithArticleID(articleID);
    res.redirect('/user');
});

// router for handling a newly created article
router.post('/createNewArticle', async function (req, res) {
    const article = req.body;
    await articleDao.createArticle(article);
    res.setToastMessage('Successfully created an article!');

    //Wendy's part
    const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken);
    const authorID = user.id;
    const authorName = await subscribeDao.retrieveUsernameByID(authorID);
    const subscribers =
        await subscribeDao.retriveMySubscribersNamesByMyID(authorID);
    let content = `{notificationType: 'new_article_notification'}, {authorID: '${authorID}'}, {authorName: '${authorName.username}'}, {publishTime: '${article.publishTime}'}, {articleID: '${article.id}'}, {title: '${article.title}'}`;

    subscribers.forEach(async function (element) {
        await subscribeDao.initNotificateTable(content, authorID, element.id);
    });

    res.status(200).json({ message: 'Data saved successfully' });
});

// router for handling a updated article
router.post('/updateArticle', async function (req, res) {
    const article = req.body;
    await articleDao.updateArticle(article);
    res.setToastMessage('Successfully updated an article!');
    res.status(200).json({ message: 'Data saved successfully' });
});

router.post('/userAnalytics', async function (req, res) {
    const user = res.locals.user;
    //Total number of followers
    const subscribers = await subscribeDao.retriveMySubscribersNamesByMyID(
        user.id
    );
    res.locals.numberOfSubcribers = subscribers.length;

    //Total number of comments
    const articles = await articleDao.retrieveArticlesWithUID(user.id);

    let articleTotalComments = 0;
    for (const article of articles) {
        let comments = await commentDao.searchCommentsByArticleID(article.id);
        
        articleTotalComments += comments.length;
    }
    res.locals.articleTotalComments = articleTotalComments;

    //Totol number of likes of all articles by current user

    let articleTotalLikes = 0;
    for (const article of articles) {
        let likes = await articleDao.articleNumberOfLikes(article.id);
        articleTotalLikes += likes[0].likeCount;
    }
    res.locals.articleTotalLikes = articleTotalLikes;

    //Top 3 articles based on popularity
    //rank index
    const Handlebars = require('handlebars');
    Handlebars.registerHelper('indexPlusOne', function (index) {
        return index + 1;
    });

    //Add popularity to articles
    const articlesPopularityPromises = articles.map(async (article) => {
        const likes = await articleDao.articleNumberOfLikes(article.id);
        let totalLikes = 0;
        for (const like of likes) {
            totalLikes += like.likeCount;
        }
       
        const comments = await commentDao.searchCommentsByArticleID(article.id);
        
        const totalComments = comments.length;

        const popularity = totalLikes + totalComments * 2;
        

        return { ...article, totalLikes, totalComments, popularity };
    });

    const articlesWithPopularity = await Promise.all(
        articlesPopularityPromises
    );

    //sort articles by popularity
    articlesWithPopularity.sort((a, b) => b.popularity - a.popularity);
    

    //show only top 3
    const top3Articles = articlesWithPopularity.slice(0, 3);

    //comments chart
    //get last 10 days
    const last10days = [];
    const currentDate = new Date();

    for (let i = 0; i < 10; i++) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() - i);
        last10days.push(date.toISOString().substring(0, 10));
    }
    const datesForXValues = last10days.reverse();
    //get dynamic x-values
    const xValues = datesForXValues;
    res.locals.xValues = xValues;

    //daily comments
    const yValues = [];

    for (let i = 0; i < xValues.length; i++) {
        const startDate = xValues[i];
        const endDate = xValues[i + 1] || '2100-01-01';
        let dailyComments = 0;
        for (const article of articles) {
            const numberOfComments =
                await commentDao.numberOfCommentsByUserIDAndDate(
                    article.id,
                    startDate,
                    endDate
                );
            
            dailyComments += numberOfComments[0].count;
            
        }
        //y values
        yValues.push(dailyComments);
    }

    res.locals.yValues = yValues;

    res.render('analytics', {
        xValues: JSON.stringify(xValues),
        yValues,
        articles: top3Articles,
    });
});

/**
 * Ian's feature/article-img-upload-v1 implementation
 */

// Set up multer, files will be temporarily be saved
// in the temp folder
const path = require('path');
const multer = require('multer');
const upload = multer({
    dest: path.join(__dirname, 'temp'),
});

// router for handling user image upload
router.post(
    '/uploadImage',
    upload.single('imageFile'),
    async function (req, res) {
        const fileInfo = req.file;

        // Move the file somewhere more sensible
        const oldFileName = fileInfo.path;
        const newFileName = `./public/uploadedImgs/${fileInfo.originalname}`;
        fs.renameSync(oldFileName, newFileName);

        res.json({ imageURL: newFileName });
    }
);

// router for handling creating new articles with only imgURL
router.post('/createNewArticleWithImgURL', async function (req, res) {
    const article = req.body;
    await articleDao.createArticleWithImgURL(article);
    res.json({
        newArticleID: article.id,
    });
});

//
router.post('/updateArticleWithImgURL', async function (req, res) {
    const article = req.body;
    await articleDao.updateArticleWithImgURL(article);
    res.json({ message: 'update article with image url successfully.' });
});

router.get('/settingEditor', async function (req, res) {
    res.locals.allUsers = await settingDao.getAllUserdetails();
    res.render('settingEditor');
});

router.post('/settingEditor', async function (req, res) {
    res.locals.allUsers = await settingDao.getAllUserdetails();
    res.render('settingEditor');
});

module.exports = router;
