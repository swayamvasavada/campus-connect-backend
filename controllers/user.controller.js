const bcrypt = require('bcryptjs');

const User = require('../models/User');
const validators = require('../util/validators');
const mailTemplete = require('../util/mail-templete');
const jwt = require('../util/token');
const accountActivator = require('../util/requestActivation');
const Task = require('../models/Task');
const Group = require('../models/Groups');

async function resendEmail(req, res, next) {
    try {
        console.log("Res locals userid: ", res.locals.userId);
        
        const user = await User.findById(res.locals.userId, { email: 1, name: 1, isActivated: 1, lastVerificationRequestTime: 1, verificationRequestCount: 1 });
        console.log("User: ", user);
        
        if(!user) return res.status(404).json({
            hasError: true,
            message: "User not found"
        });

        if (user.isActivated) return res.json({
            hasError: true,
            message: "Account is already activated"
        });

        const now = new Date();
        const yesterday = new Date(now - 24 * 60 * 60 * 1000);

        if (!user.lastVerificationRequestTime || new Date(user.lastVerificationRequestTime) < yesterday) {
            user.lastVerificationRequestTime = now;
            user.verificationRequestCount = 1; // reset count after 24 hours
        } else {
            user.verificationRequestCount += 1;
            if (user.verificationRequestCount > 3) {
                return res.status(429).json({
                    hasError: true,
                    message: "You have exceeded the maximum number of activation requests. Please try again after 24 hours."
                });
            }
        }

        await accountActivator(user);
        await user.save();

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

        user.isActivated = true;
        delete user.lastVerificationRequestTime;
        delete user.verificationRequestCount;

        await user.save();

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
        if (!user) return res.status(404).json({ hasError: true, message: "User not found" });

        return res.json({
            hasError: false,
            user
        });
    } catch (error) {
        next(error);
    }
}

async function getUserSummary(req, res, next) {
    try {
        const user = await User.findById(res.locals.userId, { name: 1, isActivated: 1, profilePic: 1, previousLogin: 1 });
        if (!user) return res.status(404).json({ hasError: true, message: "User not found" });

        return res.json({
            hasError: false,
            user
        });
    } catch (error) {
        next(error);
    }
}

async function dashboardData(req, res, next) {
    try {
        const tasks = await Task.find({ assignee: res.locals.userId }, { title: 1, status: 1, groupId: 1 });
        const groups = await Group.find({ members: res.locals.userId }, { name: 1, type: 1 });

        if (!tasks || !groups) {
            return res.status(404).json({
                hasError: true,
                message: "Task or Group not found"
            });
        }

        const groupMap = new Map(groups.map(group => [group._id.toString(), group]));
        const updatedTasks = tasks.map(task => {
            const groupId = task.groupId.toString();
            const group = groupMap.get(groupId);
            const updatedTask = { ...task.toObject(), group: group || null };
            return updatedTask;
        });

        return res.json({
            hasError: false,
            tasks: updatedTasks,
            groups: groups
        });
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

        console.log("Profie updated: ", profileUpdated);

        const enteredData = req.body;
        if (profileUpdated) enteredData.profilePic = req.file.path;
        const user = await User.findByIdAndUpdate(res.locals.userId, enteredData);

        console.log("User: ", user);
        return res.json(user);
    } catch (error) {
        next(error);
    }
}

async function updatePassword(req, res, next) {
    try {
        const enteredData = req.body;
        console.log("Entered data: ", enteredData);

        if (!validators.validatePasswordInput(enteredData.currentPassword) && !validators.validatePasswordInput(enteredData.password)) return res.status(400).json({
            hasError: true,
            message: "Please fill all details properly!"
        });

        const user = await User.findById(res.locals.userId);

        const isCurrentPasswordCorrect = await bcrypt.compare(enteredData.currentPassword, user.password);
        if (!isCurrentPasswordCorrect) return res.status(400).json({
            hasError: true,
            message: "Current password is incorrect!"
        });

        const hashedPassword = await bcrypt.hash(enteredData.password, 12);
        await User.updateOne(user, { password: hashedPassword });
        return res.json({
            hasError: false,
            message: "Password was updated successfully!"
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    resendEmail: resendEmail,
    activateAccount: activateAccount,
    getUserDetails: getUserDetails,
    getUserSummary: getUserSummary,
    dashboardData: dashboardData,
    searchUser: searchUser,
    updateUser: updateUser,
    updatePassword: updatePassword
}