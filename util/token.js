const jwt = require('jsonwebtoken');

if (process.env.NODE_ENV !== "production") require('dotenv').config();

function signToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '7d'});
}

module.exports = {signToken};