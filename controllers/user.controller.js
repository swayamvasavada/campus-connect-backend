const User = require('../models/User');
const mailTemplete = require('../util/mail-templete');
const jwt = require('../util/token');
const accountActivator = require('../util/requestActivation');

async function resendEmail(req, res, next) {
    try {
        const user = await User.findById(res.locals.userId, {email: 1, name: 1});

        console.log("User id: ", res.locals.userId);
        console.log("User: ", user);
        
        await accountActivator(user);

        res.json({
            hasError: false,
            message: "We have re-sent your account activation link"
        })
    } catch (error) {
        next(error);
    }
}

async function activateAccount(req, res, next) {
    const activationToken = req.params.activationToken;

    if (!activationToken || activationToken === '') return res.status(400).json({
        hasError: true,
        message: "Activation token is required"
    });

    try {
        const data = jwt.verifyToken(activationToken);
        const user = await User.findById(data.id);

        if (user.isActivated) return res.json({
            hasError: false,
            message: "Account has already been activated"
        })

        await user.updateOne({ isActivated: true });

        mailTemplete.welcomeEmail(user.email, user.name);

        res.json({
            hasError: false,
            message: "Your account has activated successfully"
        });
    } catch (error) {
        next(error);
    }
}

async function getUserDetails(req, res, next) {
    try {
        const user = await User.findById(res.locals.userId);
        if (!user) return res.status(404).json({ hasError: true, message: "Resource not found" });

        return res.json({ user });
    } catch (error) {
        next(error);
    }
}

async function searchUser(req, res, next) {
    try {
        const username = req.query.username.trim();
        if (!username) return res.status(400).json({
            hasError: true,
            message: "Please fill all details properly"
        });

        const result = await User.find({ name: { $regex: username, $options: 'i' } }, { name: 1, profilePic: 1 });

        return res.json({
            hasError: false,
            result
        });
    } catch (error) {
        next(error);
    }
}

async function updateUser(req, res, next) {
    try {
        let profileUpdated = true;
        if (!req.file || !req.file.path) profileUpdated = false;

        const enteredData = req.body;
        if (profileUpdated) enteredData.profilePic = req.file.path;
        const user = await User.findOneAndUpdate(res.locals.userId, enteredData);

        console.log("User: ", user);
        return res.json(user);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    resendEmail: resendEmail,
    activateAccount: activateAccount,
    getUserDetails: getUserDetails,
    searchUser: searchUser,
    updateUser: updateUser
}