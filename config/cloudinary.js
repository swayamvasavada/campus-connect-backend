const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const CloudinaryStorage = require('multer-storage-cloudinary').CloudinaryStorage;

if (process.env.NODE_ENV !== "production") require('dotenv').config();

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'profile-pics',
        allowed_formats: ['jpg', 'jpeg', 'png'],
    }
});

const upload = multer({ storage });

module.exports = upload;