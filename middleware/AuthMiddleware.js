const { verifyToken } = require("../util/token");

function checkAuth(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                hasError: true,
                message: 'Only authenticated user can access this part of website'
            });
        }

        const data = verifyToken(token);

        // Setting user id for request
        res.locals.userId = data.id;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = checkAuth;