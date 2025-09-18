const upload = require('../config/cloudinary');
const userController = require('../controllers/user.controller');

const router = require('express').Router();

router.get('/', userController.getUserDetails);

router.post('/resend-activation-email', userController.resendEmail);

router.post('/activate/:activationToken', userController.activateAccount);

router.get('/search', userController.searchUser);

router.put('/update-user', upload.single('image'), userController.updateUser);

module.exports = router;