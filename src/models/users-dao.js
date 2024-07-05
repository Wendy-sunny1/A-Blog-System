const SQL = require('sql-template-strings');
const { getDatabase } = require('../db/database.js');
const bcrypt = require('bcrypt');

async function createUser(user) {
    const db = await getDatabase();

    const salt = await bcrypt.genSalt(null);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    let avatarFileName;
    if (user.avatarid === '1') {
        avatarFileName = '1.png';
    } else if (user.avatarid === '2') {
        avatarFileName = '2.png';
    } else if ((user.avatarid = '3')) {
        avatarFileName = '3.png';
    }

    const result = await db.run(
        SQL`insert into users (username, password, realname, dob, description, avatarid, avatarFileName) values(${user.username},${hashedPassword}, ${user.realname}, ${user.dob}, ${user.description}, ${user.avatarid}, ${avatarFileName})`
    );
    user.id = result.lastID;
}

async function retrieveAllUsers() {
    const db = await getDatabase();

    const allUserData = await db.all(SQL`select * from users`);

    return allUserData;
}

async function retrieveUserWithCredentials(username, password) {
    const db = await getDatabase();

    const user = await db.get(
        SQL`select * from users where username = ${username}`
    );

    if (user) {
        const isPasswordVaild = await bcrypt.compare(password, user.password);
        if (isPasswordVaild) {
            return user;
        }
    }
    return null;
}

async function updateUser(user) {
    const db = await getDatabase();

    await db.run(
        SQL`update users set username = ${user.username}, password = ${user.password}, realname = ${user.realname}, dob = ${user.dob}, description = ${user.description}, avatarid = ${user.avatarid}, authToken = ${user.authToken}
        where id = ${user.id}`
    );
}

async function retrieveUserWithAuthToken(authToken) {
    const db = await getDatabase();

    const user = await db.get(
        SQL`select * from users where authToken = ${authToken}`
    );

    return user;
}

async function changeUsername(currentUserName, updatedUsername) {
    const db = await getDatabase();
    await db.run(
        SQL`update users set username = ${updatedUsername} where username = ${currentUserName}`
    );
}

async function checkUsernameAvailability(username) {
    const db = await getDatabase();

    const user = await db.get(
        SQL`SELECT * FROM users WHERE username = ${username}`
    );

    return !!user; // if username exists, return ture
}

async function changePassword(currentUsername, updatedPassword) {
    const db = await getDatabase();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(updatedPassword, salt);
    await db.run(
        SQL`update users set password = ${hashedPassword} where username = ${currentUsername}`
    );
}

async function changeAuthToken(username, authToken) {
    const db = await getDatabase();
    await db.run(
        SQL`update users set authToken = ${authToken} where username = ${username}`
    );
}

async function changeBirthday(currentDob, updatedBirthday) {
    const db = await getDatabase();
    // updatedBirthday = updatedBirthday || currentDob;
    await db.run(
        SQL`update users set dob = ${updatedBirthday} where dob = ${currentDob}`
    );
}

async function changeRealName(currentRealname, updatedRealname) {
    const db = await getDatabase();
    // updatedRealname = updatedRealname || currentRealname;
    await db.run(
        SQL`update users set realname = ${updatedRealname} where realname = ${currentRealname}`
    );
}

async function changeDescription(currentDescription, updatedDescription) {
    const db = await getDatabase();
    // updatedDescription = updatedDescription || currentDescription;
    await db.run(
        SQL`update users set description = ${updatedDescription} where description = ${currentDescription}`
    );
}

async function changeAvatar(currentAvatarFileName, updatedAvatarFileName) {
    const db = await getDatabase();
    // updatedAvatarFileName = updatedAvatarFileName || currentAvatarFileName;
    await db.run(
        SQL`update users set avatarFileName = ${updatedAvatarFileName} where avatarFileName = ${currentAvatarFileName} `
    );
}

async function retrieveUserNameWithUserID(id) {
    const db = await getDatabase();

    const user = await db.get(SQL`select * from users where id = ${id}`);

    return user.username;
}

async function retrieveUserIDByUserName(userName) {
    const db = await getDatabase();

    const user = await db.get(
        SQL`select * from users where username = ${userName}`
    );

    return user.id;
}

async function retrieveUserAvatarIDwithUserID(id) {
    const db = await getDatabase();

    const user = await db.get(SQL`select * from users where id = ${id}`);

    return user.avatarid;
}

async function retrieveAvatarFileNameByUserID(id) {
    const db = await getDatabase();

    const user = await db.get(SQL`select * from users where id = ${id}`);

    return user.avatarFileName;
}

async function retrieveUserDescriptionwithUserID(id) {
    const db = await getDatabase();

    const user = await db.get(SQL`select * from users where id = ${id}`);

    return user.description;
}

async function deleteUserByUsername(deleteUsername) {
    const db = await getDatabase();

    //delete subscribe
    await db.run(
        SQL`DELETE FROM subscribe
        WHERE subscriberID = (SELECT id FROM users WHERE username = ${deleteUsername})
        OR authorID = (SELECT id FROM users WHERE username = ${deleteUsername})`
    );

    //delete like
    await db.run(
        SQL`DELETE FROM likes
        WHERE userID = (SELECT id FROM users WHERE username = ${deleteUsername})`
    );

    //delete comment
    await db.run(
        SQL`DELETE FROM comments
        WHERE userID = (SELECT id FROM users WHERE username = ${deleteUsername})`
    );

    // delete article
    await db.run(
        SQL`delete from articles where articles.userID = (SELECT users.id FROM users WHERE username = ${deleteUsername})`
    );

    // delete username
    await db.run(SQL`delete from users where username = ${deleteUsername}`);
}

async function deleteUserByUID(uid) {
    const db = await getDatabase();

    //delete subscribe
    await db.run(
        SQL`DELETE FROM subscribe
        WHERE subscriberID = ${uid}
        OR authorID = ${uid}`
    );

    //delete like
    await db.run(
        SQL`DELETE FROM likes
        WHERE userID = ${uid}`
    );

    //delete comment
    await db.run(
        SQL`DELETE FROM comments
        WHERE userID = ${uid}`
    );

    // delete article
    await db.run(SQL`delete from articles where articles.userID = ${uid}`);

    // delete username
    await db.run(SQL`delete from users where id = ${uid}`);
}

async function retrieveUserWithUID(uid) {
    const db = await getDatabase();

    const user = await db.get(SQL`select * from users where id = ${uid}`);
    return user;
}

module.exports = {
    deleteUserByUID,
    retrieveUserWithUID,
    retrieveAllUsers,
    retrieveUserWithCredentials,
    updateUser,
    createUser,
    retrieveUserWithAuthToken,
    deleteUserByUsername,
    changeUsername,
    changePassword,
    changeAuthToken,
    changeBirthday,
    changeRealName,
    changeDescription,
    changeAvatar,
    checkUsernameAvailability,
    retrieveUserNameWithUserID,
    retrieveUserAvatarIDwithUserID,
    retrieveUserDescriptionwithUserID,
    retrieveUserIDByUserName,
    retrieveAvatarFileNameByUserID,
};
