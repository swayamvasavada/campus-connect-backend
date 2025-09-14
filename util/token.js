const jwt = require('jsonwebtoken');

if (process.env.NODE_ENV !== "production") require('dotenv').config();

function signToken(payload, loginToken) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: loginToken ? '7d' : '15m' });
}

function verifyToken(token) {
    let result;
    jwt.verify(token, process.env.JWT_SECRET, function (err, data) {
        if (err) throw err;        
        result = data;
    });
    return result;
}

module.exports = { signToken, verifyToken };