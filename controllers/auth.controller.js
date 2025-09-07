const bcrypt = require('bcryptjs');

const User = require('../models/User');
const validators = require('../util/validators');
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

        const token = jwt.signToken({ id: newUser._id });
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

        const token = jwt.signToken({id: user._id});
        res.json({user, token});
    } catch (error) {
        next(error);
    }
}

module.exports = {
    signup: signup,
    login: login
}