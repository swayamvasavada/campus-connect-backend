const jwt = require("./token");
const mailer = require("./mail-templete");

async function requestActivation(user) {
    try {
        console.log("User: ", user);
        
        const activationToken = jwt.signToken({ id: user._id });
        mailer.sendActivationEmail(activationToken, user.email, user.name);
    } catch (error) {
        throw error;
    }
}

module.exports = requestActivation;