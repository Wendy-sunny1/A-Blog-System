function cookieToaster(req, res, next) {
    // check if client already has a toastMessage
    const clientToastCookie = req.cookies.toastMessage;

    if (clientToastCookie !== undefined) {
        // tell browser to clear client toastMessage (only occurs if browser receives this clear cookie message)
        res.clearCookie('toastMessage');
        // store the toastMessage that is scheduled to be clear
        res.locals.toastMessage = clientToastCookie;
    }

    // attach function to specify a new toast message
    res.setToastMessage = function (message) {
        res.cookie('toastMessage', message);
    };

    next();
}

module.exports = {
    cookieToaster,
};
