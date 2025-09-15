const bcrypt = require('bcryptjs');

const User = require('../models/User');
const validators = require('../util/validators');
const mailTemplete = require('../util/mail-templete');
const jwt = require('../util/token');

async function signup(req, res, next) {
    try {
        const enteredData = req.body;
        console.log("Entered data: ", enteredData);

        // Validation
        if (!validators.validateSignupInput(enteredData)) {
            return res.status(400).json({ hasError: true, message: "Please fill all details properly" });
        }

        //Check for existing user
        const existingUser = await User.findOne({ email: enteredData.email });
        if (existingUser) {
            return res.status(400).json({ hasError: true, message: "Please fill all details properly" });
        }

        const hashedPassword = await bcrypt.hash(enteredData.password, 12);
        const newUser = new User({
            name: enteredData.name.trim(),
            email: enteredData.email.toLowerCase(),
            password: hashedPassword
        });
        await newUser.save();

        const token = jwt.signToken({ id: newUser._id }, true);
        await User.findOneAndUpdate({ email: enteredData.email }, { previousLogin: newUser.lastLogin, lastLogin: new Date() });

        mailTemplete.welcomeEmail(newUser.email, newUser.name);

        return res.status(201).json({ user: newUser, token });
    } catch (error) {
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const enteredData = req.body;

        // Validation
        if (!validators.validateLoginInput(enteredData)) {
            return res.status(400).json({ hasError: true, message: "Please fill all details properly" });
        }

        const user = await User.findOne({ email: enteredData.email });

        // Checking if user exist or not
        if (!user) {
            return res.status(400).json({ hasError: true, message: "Seems like email or password is incorrect!" });
        }

        const isMatch = await bcrypt.compare(enteredData.password, user.password);
        if (!isMatch) {
            return res.status(400).json({ hasError: true, message: "Seems like email or password is incorrect!" });
        }

        const token = jwt.signToken({ id: user._id }, true);
        await User.findOneAndUpdate({ email: enteredData.email }, { previousLogin: user.lastLogin, lastLogin: new Date() });
        res.json({ user, token });
    } catch (error) {
        next(error);
    }
}

async function requestReset(req, res, next) {
    const email = req.body.email;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = email && emailRegex.test(email);

    if (!isValidEmail) return res.status(400).json({
        hasError: true,
        message: 'Please enter a valid email!'
    });

    try {
        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).json({
            hasError: true,
            message: 'User does not exist'
        });

        const token = jwt.signToken({ id: user._id });

        mailTemplete.requestResetEmail(user.email, user.name, token);

        res.json({
            hasError: false,
            message: "We have sent you reset link on your email"
        });
    } catch (error) {
        next(error);
    }
}

async function resetPassword(req, res, next) {
    const resetToken = req.params["resetToken"];
    const enteredData = req.body;
    if (!resetToken || resetToken === '') return res.status(400).json({
        hasError: true,
        message: "Reset token not found"
    });

    if (!validators.validatePasswordInput(enteredData.password)) return res.status(400).json({
        hasError: true,
        message: "Please fill all details properly!"
    });

    try {
        const hashedPassword = await bcrypt.hash(enteredData.password, 12);

        const id = jwt.verifyToken(resetToken).id;
        const user = await User.findById(id);
        await user.updateOne({ password: hashedPassword });
        
        mailTemplete.resetConfirmation(user.email, user.name);

        return res.json({
            hasError: false,
            message: "Password updated successfully"
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    signup: signup,
    login: login,
    requestReset: requestReset,
    resetPassword: resetPassword
}