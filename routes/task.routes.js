const router = require('express').Router();

const taskController = require('../controllers/task.controller');

router.get('/fetch/:groupId', taskController.getTask);

router.get('/members/:groupId', taskController.getMembers);

router.post('/create-task', taskController.createTask);

router.delete('/delete-task/:id', taskController.deleteTask);

router.put('/update-task/:id', taskController.updateTask);

router.patch('/update-status', taskController.updateStatus);

module.exports = router;