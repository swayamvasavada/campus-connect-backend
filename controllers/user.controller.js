const User = require('../models/User');

async function getUserDetails(req, res, next) {
    try {
        const user = await User.findById(res.locals.userId);
        if (!user) return res.status(404).json({hasError: true, message: "Resource not found"});

        return res.json({user});
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
        const user = await User.findOneAndUpdate(res.locals.id, enteredData);
        
        console.log("User: ", user);
        return res.json(user);    
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getUserDetails: getUserDetails,
    updateUser: updateUser
}