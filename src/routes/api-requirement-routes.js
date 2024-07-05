const { v4: uuid } = require('uuid');
const express = require('express');
const router = express.Router();

const userDao = require('../models/users-dao.js');
const articleDao = require('../models/articles-dao.js');

/**************************************************************************************
 * First route:
 */
router.post('/api/login', async (req, res) => {
    // Get the username and password supplied as JSON in the request body
    const username = req.body.username;
    const password = req.body.password;

    // Find a matching user in the database
    const user = await userDao.retrieveUserWithCredentials(username, password);

    // if there is a matching user, a 204 response should be returned along with
    // info that can be used to identify the authenticated user in the future
    // (some kind of authentication token)
    if (user) {
        // Auth success - give that user an authToken, save the token in a cookie, and
        const authToken = uuid();
        user.authToken = authToken;
        await userDao.updateUser(user);
        res.cookie('authToken', authToken);
        return res.status(204).end();
    }

    // Otherwise, if there is no matching user
    else {
        // If unsuccessful, instead a 401 response should be returned
        return res.status(401).json({ message: 'Unauthorized' });
    }
});

/*************************************************************************************
 * Second route:
 */
router.get('/api/logout', (req, res) => {
    res.clearCookie('authToken');
    return res.status(204).end();
});

/*************************************************************************************
 * Third route:
 */
router.get('/api/users', async (req, res) => {
    const userCookie = req.cookies.authToken;

    if (userCookie) {
        const user = await userDao.retrieveUserWithAuthToken(userCookie);

        if (user) {
            if (user.username === 'wche751' || user.username === 'szho231') {
                // an array of all users should be returned as JSON, for each user
                // all of their profile info should be included, along with the number
                // of articles that user has authored
                const allUsers = await userDao.retrieveAllUsers();
                const allArticles = await articleDao.retrieveAllArticles();

                for (let eachUser of allUsers) {
                    eachUser.numOfArticles = 0;
                }

                for (let eachArticle of allArticles) {
                    const userID = eachArticle.userID;

                    for (let eachUser of allUsers) {
                        if (eachUser.id === userID) {
                            eachUser.numOfArticles++;
                        }
                    }
                }

                return res.status(200).json(allUsers);
            }
        }
    }

    return res.status(401).json({ message: 'Unauthorized' });
});

/*************************************************************************************
 * Fourth route:
 */
router.delete('/api/users/:id', async (req, res) => {
    const userCookie = req.cookies.authToken;

    if (userCookie) {
        const user = await userDao.retrieveUserWithAuthToken(userCookie);

        if (user) {
            if (user.username === 'wche751' || user.username === 'szho231') {
                const userToBeDeletedID = req.params.id;
                const userToBeDeleted =
                    await userDao.retrieveUserWithUID(userToBeDeletedID);

                if (userToBeDeleted) {
                    await userDao.deleteUserByUID(userToBeDeletedID);

                    return res.status(204).end();
                }

                return res.status(204).end();
            }
        }
    }

    return res.status(401).json({ message: 'Unauthorized' });
});

module.exports = router;
