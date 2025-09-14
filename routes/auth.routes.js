const router = require('express').Router();
const authController = require('../controllers/auth.controller');

router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.post('/request-reset', authController.requestReset);

router.post('/reset-password/:resetToken', authController.resetPassword);

module.exports = router;