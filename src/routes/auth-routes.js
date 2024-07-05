const { v4: uuid } = require('uuid');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const router = express.Router();
const multer = require('multer');
const upload = multer({
    dest: 'temp',
});
const fs = require('fs');
router.use(
    session({
        secret: 'your_secret_key',
        resave: true,
        saveUninitialized: true,
    })
);

// The DAO that handles CRUD operations for users
const userDao = require('../models/users-dao.js');
const articlesDao = require('../models/articles-dao.js');
const subscribeDao = require('../models/subscribe-dao.js');
// Whenever we navigate to /login, if we're already logged
// in, redirect to "/". Otherwise, render the "login" view
router.get('/login', async function (req, res) {
    if (res.locals.user) {
        const articles = await articlesDao.retrieveArticlesByUserID(
            res.locals.user.id
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
        const number = await subscribeDao.getNotificationNumber(
            res.locals.user.id
        );
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

// Whenever we POST to /login, check the username and password
// submitted by the user. If they match a user in the db, give
// that user an authToken, save the authToken in a cookie, and
// redirect to "/". Otherwise, redirect to "/login", with a log
// in failed message.
router.post('/login', async function (req, res) {
    // Get the username and password submitted in the form
    const username = req.body.username;
    const password = req.body.password;

    // Find a matching user in the database
    const user = await userDao.retrieveUserWithCredentials(username, password);

    if (user) {
        const isPasswordVaild = await bcrypt.compare(password, user.password);
        if (isPasswordVaild) {
            const authToken = uuid();
            user.authToken = authToken;
            await userDao.updateUser(user);
            res.cookie('authToken', authToken);
            res.locals.user = user;
            req.session.user = user;
            const articles = await articlesDao.retrieveArticlesByUserID(
                user.id
            );

            //No. of articles
            const articleNo = articles.length;
            //No. of followers
            const subscribers =
                await subscribeDao.retriveMySubscribersNamesByMyID(
                    res.locals.user.id
                );
            const numberOfSubcribers = subscribers.length;
            //No. of followings
            const authors = await subscribeDao.retriveMyAuthorsNamesByMyID(
                res.locals.user.id
            );
            const numberOfauthors = authors.length;

            for (let eachArticle of articles) {
                eachArticle.content = processArticleContent(
                    eachArticle.content
                );

                eachArticle.content = processArticleContentSecond(
                    eachArticle.content
                );
            }
            res.locals.allArticles = articles;
            res.locals.articleNo = articleNo;
            res.locals.numberOfSubcribers = numberOfSubcribers;
            res.locals.numberOfauthors = numberOfauthors;

            // const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken);
            const number = await subscribeDao.getNotificationNumber(
                res.locals.user.id
            );
            res.locals.number = number.notificationNumber;
            console.log(number.notificationNumber);
            res.render('user');
        } else {
            // Otherwise, if there's no matching user...
            res.locals.user = null;
            res.setToastMessage('Authentication failed!');
            res.redirect('./login');
        }
    } else {
        res.locals.user = null;
        req.session.user = null;
        res.setToastMessage('Either the user name or password (or both) is incorrect!');
        res.redirect('./login');
    }
});

// // Whenever we navigate to /logout, delete the authToken cookie
// // redirect to "/login", supplying a "logged out successfully" message.
router.get('/logout', function (req, res) {
    res.clearCookie('authToken');
    res.locals.user = null;
    req.session.user = null;
    res.redirect('/login');
});

// Account Creation
router.get('/newAccount', function (req, res) {
    res.render('new-account');
});

router.post('/newAccount', async function (req, res) {
    const user = {
        username: req.body.username,
        realname: req.body.realname,
        password: req.body.password,
        dob: req.body.dob,
        description: req.body.description,
        avatarid: req.body.avatar,
    };

    // checking if password matches
    const confirmPassword = req.body.confirmPassword;
    if (user.password !== confirmPassword) {
        res.setToastMessage('Passwords do not match.');
        res.redirect('/newAccount');
        return;
    }

    try {
        await userDao.createUser(user);
        res.setToastMessage(
            'Account creation successful. Please login using your new credentials.'
        );
        res.redirect('/login');
    } catch (err) {
        res.setToastMessage('That username is already taken!');
        res.redirect('/newAccount');
    }
});

router.post('/checkUsernameAvailability', async (req, res) => {
    const username = req.body.username;
    //checking if the chosen username is already in the database
    const userExists = await userDao.checkUsernameAvailability(username);
    res.json({ usernameExists: userExists });
});

// change profile
router.get('/changeProfile', function (req, res) {
    res.render('changeProfile');
});
router.post('/changeProfile', async function (req, res) {
    //new username
    const updatedUsername = req.body.newUsername;

    // current username
    const currentUsername01 = req.session.user.username;

    if (updatedUsername !== currentUsername01) {
        const usernameExists =
            await userDao.checkUsernameAvailability(updatedUsername);
        if (usernameExists) {
            res.setToastMessage('Username is already taken.');
            res.redirect('/settingEditor');
        } else {
            req.session.user.username = updatedUsername;
            await userDao.changeUsername(currentUsername01, updatedUsername);
        }
    }

    // change profile password
    // new password
    const updatedPassword = req.body.newPassword;

    // current username
    const currentUsername02 = req.session.user.username;
    await userDao.changePassword(currentUsername02, updatedPassword);

    // Generate a new authToken after changing the password
    const authToken = uuid();
    
    await userDao.changePassword(currentUsername02, updatedPassword); // Change password
    await userDao.changeAuthToken(currentUsername02, authToken);

    req.session.user.authToken = authToken;
    res.cookie('authToken', authToken);

    // new
    const updatedRealname = req.body.newRealName;
    const updatedBirthday = req.body.newBirthday;
    const updatedDescription = req.body.newDescription;
    let updatedAvatarFileName;

    // current
    const currentRealname = req.session.user.realname;
    const currentBirthday = req.session.user.dob;
    const currentDescription = req.session.user.description;
    const selectedAvatarValue = req.body.avatar;

    req.session.user.realname = updatedRealname;
    await userDao.changeRealName(currentRealname, updatedRealname);
    req.session.user.dob = updatedBirthday;
    await userDao.changeBirthday(currentBirthday, updatedBirthday);
    req.session.user.description = updatedDescription;
    await userDao.changeDescription(currentDescription, updatedDescription);

    if (selectedAvatarValue === '1') {
        updatedAvatarFileName = '1.png';
    } else if (selectedAvatarValue === '2') {
        updatedAvatarFileName = '2.png';
    } else if (selectedAvatarValue === '3') {
        updatedAvatarFileName = '3.png';
    } else {
        updatedAvatarFileName = req.session.user.avatarFileName;
    }

    const currentAvatarFileName = req.session.user.avatarFileName;
    await userDao.changeAvatar(currentAvatarFileName, updatedAvatarFileName);
    req.session.user.avatarFileName = updatedAvatarFileName;

    res.setToastMessage('Profile updated successfully!');
    res.redirect('/settingEditor');
});

router.get('/deleteCurrentAccount', function (req, res) {
    res.render('deleteCurrentAccount');
});

router.post('/deleteCurrentAccount', async function (req, res) {
    const deleteUsername = req.body.deleteAccount;
    const currentUsername = req.session.user.username;
    if (deleteUsername === currentUsername) {
        await userDao.deleteUserByUsername(deleteUsername);
        // res.clearCookie('authToken');
        // req.session.user = null;
        res.setToastMessage('Account deleted successfully');
        res.redirect('/');
    } else {
        res.setToastMessage('INVAILD USERNAME!');
        res.redirect('/settingEditor');
    }
});

module.exports = router;
