const router = require('express').Router();

// const mongoose = require('mongoose');
const groupController = require('../controllers/group.controller');

router.get('/my-groups', groupController.myGroups);

router.get('/members/:groupId', groupController.getMembers);

router.get('/search', groupController.searchGroups);

router.post('/create-group', groupController.createGroup);

router.post('/join-group/:groupId', groupController.joinGroup);

router.patch('/promote-member', groupController.promoteMember);

router.patch('/demote-member', groupController.demoteMember);

router.delete('/remove-member', groupController.removeMember);

module.exports = router;