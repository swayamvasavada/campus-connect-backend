const Task = require('../models/Task');
const Group = require('../models/Groups');
const User = require("../models/User");

const validators = require('../util/validators');
const mongoose = require('mongoose');

async function getTask(req, res, next) {
    let tasks;
    const groupId = req.params.groupId;
    const userId = res.locals.userId;

    try {
        const group = await Group.findById(groupId, { _id: 0, name: 1, description: 1, moderators: 1 });
        if (!group) return res.status(404).json({
            hasError: true,
            message: "Group not found"
        });

        const isModerator = group.moderators.includes(userId);
        tasks = isModerator ? await Task.find({ groupId: groupId }) : await Task.find({ groupId: groupId, assignee: userId })

        for (const task of tasks) {
            const assigneeId = task.assignee;
            const userData = await User.findOne({ _id: assigneeId }, { name: 1 });
            task.assignee = userData;
        }

        return res.json({
            hasError: false,
            name: group.name,
            description: group.description,
            tasks
        });
    } catch (error) {
        next(error);
    }
}

async function getMembers(req, res, next) {
    const groupId = req.params.groupId;

    try {
        const groupData = await Group.findById(groupId, { members: 1, moderators: 1 });
        const isModerator = groupData.moderators.includes(new mongoose.Types.ObjectId(res.locals.userId));

        const memberIds = isModerator ? groupData.members : [res.locals.userId];
        const members = await User.find({ _id: { $in: memberIds } }, {name: 1});

        return res.json({
            isModerator,
            members: members
        });
    } catch (error) {
        next(error);
    }
}

async function createTask(req, res, next) {
    const enteredData = req.body;
    const isValidInput = validators.validateTaskInput(enteredData);

    if (!isValidInput) return res.status(400).json({
        hasError: true,
        message: "Please fill all details properly"
    });

    try {
        const groupData = await Group.findById(enteredData.groupId, { _id: 0, type: 1, members: 1, moderators: 1 });
        if (!groupData) return res.status(404).json({
            hasError: true,
            message: "Group not found"
        });

        const userId = res.locals.userId;
        if (!groupData.moderators.includes(userId) || !enteredData.assignee) enteredData.assignee = userId;

        if (!groupData.members.find(id => id.equals(enteredData.assignee))) return res.status(400).json({
            hasError: true,
            message: `Assignee is not part of this ${groupData.type}`
        });

        enteredData.createdBy = userId;
        const task = await Task.insertOne(enteredData);

        return res.status(201).json({
            hasError: false,
            task
        });
    } catch (error) {
        next(error);
    }
}

async function deleteTask(req, res, next) {
    const taskId = req.params.id;
    const userId = res.locals.userId;

    try {
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({
            hasError: true,
            message: "Task not found"
        });

        if (!task.createdBy.equals(userId)) return res.status(401).json({
            hasError: true,
            message: "You cannot delete a task which is not created by you!"
        });

        await task.deleteOne();
        return res.json({
            hasError: false,
            message: "Deleted Successfully"
        });
    } catch (error) {
        next(error);
    }
}

async function updateTask(req, res, next) {
    const taskId = req.params.id;
    const userId = res.locals.userId;
    const enteredData = req.body;

    try {
        let task = await Task.findById(taskId);
        if (!task) return res.status(404).json({
            hasError: true,
            message: "Task not found"
        });

        if (!task.createdBy.equals(userId)) return res.status(401).json({
            hasError: true,
            message: "You cannot update a task which is not created by you!"
        });

        const groupModerators = await Group.findById(enteredData.groupId, { _id: 0, moderators: 1 });
        if (!groupModerators.moderators.includes(userId)) enteredData.assignee = userId;

        task = await task.updateOne(enteredData);
        return res.json({
            hasError: false,
            task: enteredData
        });
    } catch (error) {
        next(error);
    }
}

async function updateStatus(req, res, next) {
    const taskId = req.body.taskId;
    const newStatus = req.body.newStatus;

    try {
        let task = await Task.findById(taskId);
        let groupModerators = await Group.findById(task.groupId, {moderators: 1});

        if (!groupModerators.moderators.includes(res.locals.userId) && !task.assignee.equals(res.locals.userId)) return res.status(401).json({
            hasError: true,
            message: "You are not the assignee of this task"
        });

        task = await task.updateOne({ $set: { status: newStatus } });
        return res.json({
            hasError: false,
            message: "Status updated"
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getTask: getTask,
    getMembers: getMembers,
    createTask: createTask,
    deleteTask: deleteTask,
    updateTask: updateTask,
    updateStatus: updateStatus
}