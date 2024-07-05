const express = require('express');
const router = express.Router();

const articleDao = require('../models/articles-dao.js');
const subscribeDao = require('../models/subscribe-dao.js');

router.get('/user/', async (req, res) => {
    if (res.locals.user) {
        let articles = await articleDao.retrieveArticlesWithUserName(
            res.locals.user.username
        );
        //No. of articles
        const articleNo = articles.length;
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
            eachArticle.content = processArticleContentSecond(
                eachArticle.content
            );
        }
        res.locals.allArticles = articles;
        res.locals.articleNo = articleNo;
        res.locals.numberOfSubcribers = numberOfSubcribers;
        res.locals.numberOfauthors = numberOfauthors;

        // const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken);
        const number = await subscribeDao.getNotificationNumber(res.locals.user.id);
        res.locals.number = number.notificationNumber;
        console.log(number.notificationNumber);
        res.render('user');
    } else {
        res.render('login');
    }
});

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
module.exports = router;
