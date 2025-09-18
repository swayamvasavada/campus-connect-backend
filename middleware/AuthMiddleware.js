const User = require("../models/User");
const jwt = require("../util/token");

async function checkAuth(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                hasError: true,
                message: 'Only authenticated user can access this part of website'
            });
        }

        const data = jwt.verifyToken(token);

        // Setting user id for request
        res.locals.userId = data.id;

        const excludedRoutes = ['/api/user/resend-activation-email', /^\/api\/user\/activate\/[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+$/] // Match /api/user/activate/{activateToken} (alphanumeric token)];  // Routes to exclude
        console.log("Req: ", req.path);

        for (let route of excludedRoutes) {
            if (route instanceof RegExp && route.test(req.path)) {
                return next();
            }
            if (route === req.path) {
                return next();
            }
        }

        const accountStatus = await User.findById(data.id, { isActivated: 1 });

        if (!accountStatus.isActivated) {
            return res.status(401).json({
                hasError: true,
                message: "Your email is not verified! Please verify your email"
            });
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = checkAuth;