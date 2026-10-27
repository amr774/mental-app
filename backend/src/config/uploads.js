const path = require('node:path');
module.exports = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'));
