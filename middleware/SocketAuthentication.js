const User = require('../models/User');
const jwt = require('../util/token');

async function checkAuth(authHeader) {
    const token = authHeader?.split(' ')[1];
    if (!token) {
        return;
    }

    const data = jwt.verifyToken(token);
    const accountStatus = await User.findById(data.id, { isActivated: 1 });
    if (!accountStatus.isActivated) return;

    return data.id;
}

module.exports = checkAuth;