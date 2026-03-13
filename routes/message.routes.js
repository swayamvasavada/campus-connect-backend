const router = require('express').Router();

const messageController = require('../controllers/message.controller');

router.get('/recent-chats', messageController.fetchRecentMessage);

router.get('/fetch-messages', messageController.fetchMessages);

module.exports = router;