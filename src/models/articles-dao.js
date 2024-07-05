const SQL = require('sql-template-strings');
const { getDatabase } = require('../db/database.js');

async function retrieveAllArticles() {
    const db = await getDatabase();

    const allArticleData = await db.all(SQL`select * 
                                            from users u, articles a
                                            where u.id = a.userID`);
    return allArticleData;
}

async function retrieveArticlesByUserID(userID) {
    const db = await getDatabase();
    const currentUserArticles = await db.all(SQL`select * from articles where userID = ${userID}`);
    return currentUserArticles;
}

async function retrieveArticlesWithSearchAndSort(searchTerm, sortTerm) {
    let articles = await retrieveAllArticles();
    // title, username, publishTime

    const filteredArticles = articles.filter(
        (article) =>
            article.title.toLowerCase().includes(searchTerm) ||
            article.username.toLowerCase().includes(searchTerm) ||
            article.publishTime.includes(searchTerm)
    );

    const sortedArticles = [...filteredArticles].sort((a, b) => {
        if (sortTerm === 'publishTime') {
            return new Date(b.publishTime) - new Date(a.publishTime);
        } else if (sortTerm === 'username') {
            return a.username.localeCompare(b.username);
        } else {
            return a.title.localeCompare(b.title);
        }
    });

    return sortedArticles;
}

async function retrieveArticlesWithSearchAndSortForUID(
    uid,
    searchTerm,
    sortTerm
) {
    let articles = await retrieveArticlesWithUID(uid);
    // title, username, publishTime

    const filteredArticles = articles.filter(
        (article) =>
            article.title.toLowerCase().includes(searchTerm) ||
            article.username.toLowerCase().includes(searchTerm) ||
            article.publishTime.includes(searchTerm)
    );

    const sortedArticles = [...filteredArticles].sort((a, b) => {
        if (sortTerm === 'publishTime') {
            return new Date(b.publishTime) - new Date(a.publishTime);
        } else if (sortTerm === 'username') {
            return a.username.localeCompare(b.username);
        } else {
            return a.title.localeCompare(b.title);
        }
    });

    return sortedArticles;
}

async function retrieveArticlesWithUID(uid) {
    const db = await getDatabase();

    const result = await db.all(SQL`select * 
                                            from users u, articles a
                                            where u.id = a.userID
                                            and u.id = ${uid}`);
    return result;
}

async function retrieveArticleWithArticleID(articleID) {
    const db = await getDatabase();

    const result = await db.get(
        SQL`select * from articles where id = ${articleID}`
    );

    return result;
}

async function retrieveArticlesWithUserName(username) {
    const db = await getDatabase();

    const result = await db.all(SQL`select * 
                                            from users u, articles a
                                            where u.id = a.userID
                                            and u.username = ${username}`);
    return result;
}

async function deleteArticleWithArticleID(articleID) {
    const db = await getDatabase();
    return await db.run(SQL`
    delete from articles
    where id = ${articleID}`);
}

async function createArticle(article) {
    const db = await getDatabase();

    const result = await db.run(SQL`
        insert into articles (title, publishTime, content, imageURL, userID, likeCount) values 
        (${article.title}, ${article.publishTime}, ${article.content}, '', ${article.userID}, 0)`);

    article.id = result.lastID;
}

async function updateArticle(article) {
    const db = await getDatabase();

    return await db.run(SQL`
        update articles
        set title = ${article.title}, publishTime = ${article.publishTime}, content = ${article.content}
        where id = ${article.articleID}`);
}

async function articleNumberOfLikes(articleID) {
    const db = await getDatabase();

    const totalNumberOfLikes = await db.all(
        SQL`SELECT likeCount FROM articles WHERE id = ${articleID}`
    );
    return totalNumberOfLikes;
}

/**
 * Ian's feature/article-img-upload-v1 implementation
 */
async function createArticleWithImgURL(article) {
    const db = await getDatabase();

    const result = await db.run(SQL`
        insert into articles (imageURL, userID) values 
        (${article.imgURL}, ${article.userID})`);

    article.id = result.lastID;
}

async function updateArticleWithImgURL(article) {
    const db = await getDatabase();

    return await db.run(SQL`
        update articles
        set imageURL = ${article.imageURL}
        where id = ${article.articleID}`);
}

async function getAuthorIdByArticleId(articleID) {
    const db = await getDatabase();
    console.log('--DAO---articleID----' + JSON.stringify(articleID))
    const authorId = await db.get(SQL`
    SELECT userID 
    FROM articles 
    WHERE id = ${articleID}`);

    console.log('--DAO---authorId----' + JSON.stringify(authorId))
    return authorId;
}

module.exports = {
    retrieveAllArticles,
    retrieveArticlesByUserID,
    retrieveArticlesWithSearchAndSort,
    retrieveArticlesWithUID,
    retrieveArticlesWithSearchAndSortForUID,
    retrieveArticleWithArticleID,
    retrieveArticlesWithUserName,
    deleteArticleWithArticleID,
    createArticle,
    createArticleWithImgURL,
    updateArticle,
    updateArticleWithImgURL,
    articleNumberOfLikes,
    getAuthorIdByArticleId
};
