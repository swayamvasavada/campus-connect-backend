const nodemailer = require('nodemailer');
if (process.env.NODE_ENV !== "production") require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.APPLICATION_EMAIL,
        pass: process.env.APPLICATION_EMAIL_PASSWORD
    },
    connectionTimeout: 10000
});

module.exports = transporter;