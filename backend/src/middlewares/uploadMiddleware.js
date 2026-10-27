const multer = require("multer");
const path   = require("path");
const crypto = require("crypto");
const fs = require('node:fs');
const avatarDirectory = path.join(require('../config/uploads'), 'avatars');
fs.mkdirSync(avatarDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, avatarDirectory);
    },
    filename: (req, file, cb) => {
        const ext = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' }[file.mimetype];
        const unique = crypto.randomBytes(16).toString("hex");
        cb(null, `${req.user.id}_${unique}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPEG, PNG, WEBP and GIF images are allowed"), false);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
});

module.exports = upload;
