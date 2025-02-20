// Setup multer (files will temporarily be saved in the "temp" folder).
const multer = require('multer');

const uploadTempFolder = multer({
    dest: 'temp',
});

// Export the "upload" object, which we can use to actually accept file uploads.
module.exports = {
    uploadTempFolder,
};
