const articleDao = require('../models/articles-dao.js');

async function checkDeletionPermission(req, res, next) {
    let userIsArticleAuthor = false;
    const author = await articleDao.getAuthorIdByArticleId(req.session.articleID);

    if (res.locals.user.id === author.userID) {
        userIsArticleAuthor = true;
    };

    res.locals.userIsArticleAuthor = userIsArticleAuthor;

    next();
};

module.exports = {
    checkDeletionPermission
};
