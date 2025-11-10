const Group = require('../models/Groups');
const User = require('../models/User');

async function myGroups(req, res, next) {
    const type = req.query.type.trim();;
    if (!type || type.length === 0) return res.status(400).json({
        hasError: true,
        message: "Group type is required"
    });

    try {
        const groups = await Group.find({
            $or: [
                { members: res.locals.userId },
                { moderators: res.locals.userId }
            ],
            type: type
        });


        return res.json({
            hasError: false,
            groups
        });
    } catch (error) {
        next(error);
    }
}

async function getMembers(req, res, next) {
    const groupId = req.params.groupId;

    try {
        const groupData = await Group.findById(groupId, { type: 1, members: 1, moderators: 1, createdBy: 1 });
        if (!groupData) return res.status(404).json({
            hasError: true,
            message: "Group not found"
        });

        if (!groupData.members.includes(res.locals.userId)) {
            return res.status(401).json({
                hasError: true,
                message: `You are not part of this ${groupData.type}`
            });
        }

        let currentUserRole = 'member';
        if (groupData.createdBy.equals(res.locals.userId)) currentUserRole = 'creator';
        else if (groupData.moderators.includes(res.locals.userId)) currentUserRole = 'moderator';

        const result = [];
        for (let i = 0; i < groupData.members.length; i++) {
            let role;
            const user = await User.findById(groupData.members[i], { name: 1, email: 1, profilePic: 1 });

            if (user._id.equals(groupData.createdBy)) role = 'creator';
            else if (groupData.moderators.includes(user._id)) role = 'moderator';
            else role = 'member';

            const userData = {
                _id: user._id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic,
                role: role
            };

            result.push(userData);
        }

        return res.json({
            hasError: false,
            userRole: currentUserRole,
            result
        });
    } catch (error) {
        next(error);
    }
}

async function searchGroups(req, res, next) {
    try {
        const groupName = req.query.groupName.trim();
        const type = req.query.type.trim();
        if (!groupName) return res.status(400).json({
            hasError: true,
            message: "Please fill all details properly"
        });

        const result = await Group.find({ name: { $regex: groupName, $options: 'i' }, type: { $regex: type, $options: 'i' } }, { name: 1, description: 1, type: 1, createdBy: 1 });

        for (const group of result) {
            const user = await User.findById(group.createdBy, { name: 1, email: 1 });
            group.createdBy = user;
        }

        return res.json({
            hasError: false,
            result
        })
    } catch (error) {
        next(error);
    }
}

async function createGroup(req, res, next) {
    const enteredData = req.body;

    try {
        const group = new Group({
            name: enteredData.name,
            description: enteredData.description,
            type: enteredData.type,
            createdBy: res.locals.userId,
            members: [res.locals.userId],
            moderators: [res.locals.userId]
        });

        const result = await group.save();
        await User.findByIdAndUpdate(res.locals.userId, { $push: { groups: result._id } });
        return res.json({
            hasError: false,
            message: "Group created successfully"
        });
    } catch (error) {
        next(error);
    }
}

async function joinGroup(req, res, next) {
    try {
        const groupId = req.params.groupId;
        const user = await User.findById(res.locals.userId);
        if (!user) throw Error("User does not exists");

        console.log("User groups: ", user.groups);


        if (user.groups.find(id => id == groupId)) return res.status(409).json({
            hasError: true,
            message: "You are already part of this group"
        });

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({
            hasError: true,
            message: "Group doesn't exist"
        });

        user.groups.push(groupId);
        group.members.push(user._id);
        await user.updateOne(user);
        await group.updateOne(group);
        return res.json({
            hasError: false,
            message: "You have joined group successfully"
        });
    } catch (error) {
        next(error);
    }
}

async function promoteMember(req, res, next) {
    const data = req.body;
    try {
        if (!data || !data.userId || !data.groupId) {
            return res.status(400).json({
                hasError: true,
                message: "Incomplete details"
            });
        }

        const user = await User.findById(data.userId, { groups: 1 });
        const group = await Group.findById(data.groupId, { type: 1, members: 1, moderators: 1 });

        if (!user || !group) {
            return res.status(404).json({
                hasError: true,
                message: "User or Group not found!"
            });
        }

        if (!group.moderators.includes(res.locals.userId)) {
            return res.status(401).json({
                hasError: true,
                message: "You are not allowed to promote any member"
            });
        }

        if (!user.groups.includes(group._id)) {
            return res.status(400).json({
                hasError: true,
                message: `User is not part of this ${group.type}`
            });
        }

        if (group.moderators.includes(user._id)) {
            return res.status(400).json({
                hasError: true,
                message: `User is already moderator of this ${group.type}`
            });
        }

        group.moderators.push(user._id);
        await group.save();

        return res.json({
            hasError: false,
            message: "User has been promoted to moderator"
        });
    } catch (error) {
        next(error);
    }
}

async function demoteMember(req, res, next) {
    const data = req.body;
    try {
        if (!data || !data.userId || !data.groupId) {
            return res.status(400).json({
                hasError: true,
                message: "Incomplete details"
            });
        }

        const user = await User.findById(data.userId, { groups: 1 });
        const group = await Group.findById(data.groupId, { type: 1, members: 1, moderators: 1 });

        if (!user || !group) {
            return res.status(404).json({
                hasError: true,
                message: "User or Group not found!"
            });
        }

        if (!group.moderators.includes(res.locals.userId)) {
            return res.status(401).json({
                hasError: true,
                message: "You are not allowed to demote any member"
            });
        }

        if (!user.groups.includes(group._id)) {
            return res.status(400).json({
                hasError: true,
                message: `User is not part of this ${group.type}`
            });
        }

        if (!group.moderators.includes(user._id)) {
            return res.status(400).json({
                hasError: true,
                message: `User is not a moderator of this ${group.type}`
            });
        }

        console.log("Group: ", group);
        group.moderators = group.moderators.filter(moderator => !moderator._id.equals(data.userId));
        
        await group.save();

        return res.json({
            hasError: false,
            message: "User has been demoted to moderator"
        });
    } catch (error) {
        next(error);
    }
}

async function removeMember(req,res,next) {
    const data = req.body;
    try {
        if (!data || !data.userId || !data.groupId) {
            return res.status(400).json({
                hasError: true,
                message: "Incomplete details!"
            });
        }

        const user = await User.findById(data.userId, {groups: 1});
        const group = await Group.findById(data.groupId, {members: 1, moderators: 1});

        if (!user || !group) {
            return res.status(404).json({
                hasError: true,
                message: "User or Group not found"
            });
        }

        if (user.groups.includes(data.groupId)) {
            const newGroups = user.groups.filter(group => !group._id.equals(data.groupId));
            user.groups = newGroups;
        }

        if (group.members.includes(data.userId)) {
            if (group.moderators.includes(data.userId)) {
                const newModerators = group.moderators.filter(moderator => !moderator.equals(data.userId));
                group.moderators = newModerators;
            }

            const newMembers = group.members.filter(member => !member.equals(data.userId));
            group.members = newMembers;
        }

        await group.save();
        await user.save();

        return res.json({
            hasError: false,
            message: "User removed successfully"
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    myGroups,
    getMembers,
    searchGroups,
    createGroup,
    joinGroup,
    promoteMember,
    demoteMember,
    removeMember
};