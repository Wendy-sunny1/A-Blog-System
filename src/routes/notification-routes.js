const express = require('express');
const router = express.Router();

router.use(express.json());

const userDao = require('../models/users-dao.js');
const subscribeDao = require('../models/subscribe-dao.js');

function parseNotifications(inputNotifications) {
    return inputNotifications.map(notification => {
        const keyValuePairsForContent = notification.content
            .replace(/[{}]/g, '') // Remove curly braces
            .split(',')
            .map(pair => pair.trim()); // Trim spaces around key-value pairs

        const notificationObject = {};
        notificationObject['notificationID'] = notification.notificateID;
        
        keyValuePairsForContent.forEach(pair => {
            const [key, value] = pair.split(': ').map(item => item.startsWith("\'") ? item.trim().slice(1, item.length - 1) : item.trim());
            notificationObject[key] = value;
        });

        return notificationObject;
    });
}

// async function getAvatarFileName(userName, users) {
//     let avatarFileName = '';
//     for(const e of users){
//         if (e.username == userName){
//             avatarFileName = await subscribeDao.retrieveAvataridByUsername(userName);
//             break;
//         }
//     }
//         return avatarFileName;
//     }

router.get('/showNotificationList', async function (req, res) {
    const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken);
    
    if(user){
    const authorID = user.id;

    const notificationList = await subscribeDao.retrieveNotificationList(authorID);
    
    const notificationMaps = parseNotifications(notificationList);
    
    let notificationClusterMap = new Map;
    let notificationClusterMapList = [];

    //let users = await subscribeDao.retriveAllUsers();
    
    notificationMaps.forEach(async e=> {
        const notificationType = e.notificationType;
        const notificateID = e.notificationID;

        if (e.notificationType == 'new_article_notification'){
            const isNewArticle = true;
            const articleID = e.articleID;
            const username = e.authorName;
            const avatarid = await subscribeDao.retrieveAvataridByUsername(username);
            
            let avatar = null;
            const notificationContent = `${e.authorName} published an article "${e.title}" at ${e.publishTime}`;
            if(avatarid == 1){
                avatar = "1.png";
            } else if(avatarid == 2){
                avatar = "2.png";
            } else {
                avatar = "3.png";
            }
            
            notificationClusterMap = {
            notificationType:notificationType,    
            notificateID: notificateID,
            isNewArticle: isNewArticle,
            articleID: articleID,
            notificationContent: notificationContent,
            avatar: avatar
            }
      } else if (e.notificationType == 'new_subscription_notification') {
        const isNewSubscriber = true;
        const subscriberID = e.subscriberID;
        const subscriberName = e.subscriberName;
        
        const avatarid = await subscribeDao.retrieveAvataridByUsername(subscriberName);
        let avatar = null;
        if(avatarid == 1){
            avatar = "1.png";
        } else if(avatarid == 2){
            avatar = "2.png";
        } else {
            avatar = "3.png";
        }
        const notificationContent = `${e.subscriberName} subscribed me!`;
        
        notificationClusterMap = {
            notificationType:notificationType,    
            notificateID: notificateID,
            isNewSubscriber: isNewSubscriber,
            subscriberID: subscriberID,
            subscriberName: subscriberName,
            notificationContent: notificationContent,
            avatar: avatar
            }
       } else if (e.notificationType == 'new_comment_notification'){
        const isNewComment = true;
        const articleID = e.articleID;
        const commenterName = e.commenterName;
        
        const avatarid = await subscribeDao.retrieveAvataridByUsername(commenterName);
        let avatar = null;
        if(avatarid == 1){
            avatar = "1.png";
        } else if(avatarid == 2){
            avatar = "2.png";
        } else {
            avatar = "3.png";
        }
        const notificationContent = `${commenterName} just made a comment on ${e.articleName} at ${e.commentTime}`;
        
        notificationClusterMap = {
            notificationType:notificationType,    
            notificateID: notificateID,
            isNewComment: isNewComment,
            articleID: articleID,
            commenterName: commenterName,
            notificationContent: notificationContent,
            avatar: avatar
            }
       } else {
        const isNewComment = true;
        const articleID = e.articleID;
        const commenterName = e.commenterName;
        
        const avatarid = await subscribeDao.retrieveAvataridByUsername(commenterName);
        let avatar = null;
        if(avatarid == 1){
            avatar = "1.png";
        } else if(avatarid == 2){
            avatar = "2.png";
        } else {
            avatar = "3.png";
        }
        const notificationContent = `${commenterName} just replied a comment on ${e.articleName} at ${e.commentTime}`;
        
        notificationClusterMap = {
            notificationType:notificationType,    
            notificateID: notificateID,
            isNewComment: isNewComment,
            articleID: articleID,
            commenterName: commenterName,
            notificationContent: notificationContent,
            avatar: avatar
            }
       }

       notificationClusterMapList.push(notificationClusterMap);
    });
   
    res.locals.notificationList = notificationClusterMapList;

    const number = await subscribeDao.getNotificationNumber(user.id);
    res.locals.number = number.notificationNumber;

    res.render("notificationList");
}
else{
    res.redirect("login");
}
});

router.post('/updateNotificationStatus/:notificateID', async function (req, res) {
    const notificationID = req.params.notificateID;
    await subscribeDao.updateClickedStatus(notificationID);
});

module.exports = router;