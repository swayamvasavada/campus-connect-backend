const nodemailer = require('nodemailer');
if (process.env.NODE_ENV !== "production") require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'SendGrid',
    auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY
    }
});

module.exports = transporter;