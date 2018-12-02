const SQL = require("sql-template-strings");

const express = require('express');
const router = express.Router();
const auth = require('./auth');
const ipApi = require('./ip-api');

router.get('/create', auth.isAuthenticated, async (req, res) => {
    res.render('pages/creategroup', {username: req.session.username});
});

router.post("/create", auth.isAuthenticated, async (req, res) => {
    const groupname = req.body.create_groupname;
    const description = req.body.create_description;

    if (groupname.length < 1 || groupname.length > 25) {
        return res.render('pages/creategroup', {username: req.session.username, message: "Group name must be between 1 and 25 characters", name: groupname});
    }
    if (/[^A-Za-z0-9\d]/.test(groupname)) {
        return res.render('pages/creategroup', {username: req.session.username, message: "Only alphanumeric characters allowed in group names", name: groupname});
    }
    if (description.length < 1) {
        return res.render('pages/creategroup', {username: req.session.username, message: "Please add a description to your group", name: groupname});
    }
    if (description.length > 5000) {
        return res.render('pages/creategroup', {username: req.session.username, message: "Description is over 5000 characters", name: groupname});
    }

    // Check if group already exists
    const group = await req.db.get(SQL`SELECT * FROM \`Group\` WHERE LOWER(GroupName) = LOWER(${groupname})`);
    if (group) {
        return res.render('pages/creategroup', {username: req.session.username, message: "Group name is taken", name: groupname});
    }

    // Creator automatically becomes a mod
    await req.db.run(SQL`INSERT INTO \`Group\` VALUES(${groupname}, ${description}, ${req.session.username})`);
    await req.db.run(SQL`INSERT OR IGNORE INTO Moderator VALUES(${req.session.username})`);
    await req.db.run(SQL`INSERT INTO Moderates VALUES(${req.session.username}, ${groupname})`);

    res.redirect("/group/" + groupname);
});

router.post("/:groupname/subscribe", auth.isAuthenticated, async (req, res) => {
    await req.db.run(SQL`INSERT OR IGNORE INTO SubscribedTo VALUES(${req.session.username}, ${req.params.groupname})`);

    res.redirect('/group/' + req.params.groupname);
});

router.post("/:groupname/unsubscribe", auth.isAuthenticated, async (req, res) => {
    await req.db.run(SQL`DELETE FROM SubscribedTo WHERE SubscriberUsername = ${req.session.username} AND GroupName = ${req.params.groupname}`);

    res.redirect('/group/' + req.params.groupname);
});

router.get('/:groupname', auth.isAuthenticated, async (req, res) => {
    const group = await req.db.get(SQL`SELECT * FROM \`Group\` WHERE LOWER(GroupName) = LOWER(${req.params.groupname})`);
    const moderator = await req.db.get(SQL`SELECT * FROM Moderates WHERE ModUsername = ${req.session.username} AND LOWER(GroupName) = LOWER(${req.params.groupname})`);
    // later we will add the group's posts too

    // being a moderator gives you more privileges
    var isMod = 0;
    if (moderator) {
        isMod = 1;
    }

    // check if user is subscribed or not
    var isSubscribed = 0;
    const subscriber = await req.db.get(SQL`SELECT * FROM SubscribedTo WHERE SubscriberUsername = ${req.session.username} AND LOWER(GroupName) = LOWER(${req.params.groupname})`);
    if (subscriber) {
        isSubscribed = 1;
    }

    if (group) {
        return res.render('pages/group', {username: req.session.username, groupinfo: group, mod: isMod, subscribed: isSubscribed});
    }
    else {
        return res.render('pages/generic', {username: req.session.username, messageH: "Group cannot be found"});
    }
});

router.get('/:groupname/moderators', auth.isAuthenticated, async (req, res) => {
    const group = await req.db.get(SQL`SELECT * FROM \`Group\` WHERE LOWER(GroupName) = LOWER(${req.params.groupname})`);
    const moderator = await req.db.get(SQL`SELECT * FROM Moderates WHERE ModUsername = ${req.session.username} AND LOWER(GroupName) = LOWER(${req.params.groupname})`);
    const groupmods = await req.db.all(SQL`SELECT * FROM Moderates WHERE LOWER(GroupName) = LOWER(${req.params.groupname})`);

    // being a moderator gives you more privileges
    var isMod = 0;
    if (moderator) {
        isMod = 1;
    }
    if (group) {
        return res.render('pages/moderators', {username: req.session.username, groupinfo: group, mod: isMod, modsinfo: groupmods});
    }
    else {
        return res.render('pages/generic', {username: req.session.username, messageH: "Group cannot be found"});
    }
});

router.post('/:groupname/moderators', auth.isAuthenticated, async (req, res) => {
    const newMod = req.body.add_moderator;

    const group = await req.db.get(SQL`SELECT * FROM \`Group\` WHERE LOWER(GroupName) = LOWER(${req.params.groupname})`);
    const moderator = await req.db.get(SQL`SELECT * FROM Moderates WHERE ModUsername = ${req.session.username} AND LOWER(GroupName) = LOWER(${req.params.groupname})`);
    var groupmods = await req.db.all(SQL`SELECT * FROM Moderates WHERE LOWER(GroupName) = LOWER(${req.params.groupname})`);

    // being a moderator gives you more privileges
    var isMod = 0;
    if (moderator) {
        isMod = 1;
    }

    // Check if user exists
    const user = await req.db.get(SQL`SELECT * FROM User WHERE LOWER(Username) = LOWER(${newMod})`);

    // Check if user is already a mod
    const alreadyMod = await req.db.get(SQL`SELECT * FROM Moderates WHERE LOWER(ModUsername) = LOWER(${newMod}) AND LOWER(GroupName) = LOWER(${req.params.groupname})`);

    if (user) {
        if (!alreadyMod) {
            await req.db.run(SQL`INSERT INTO Moderates VALUES(${user.Username}, ${req.params.groupname})`);
            groupmods = await req.db.all(SQL`SELECT * FROM Moderates WHERE LOWER(GroupName) = LOWER(${req.params.groupname})`);
            return res.render('pages/moderators', {username: req.session.username, groupinfo: group, mod: isMod, modsinfo: groupmods,
                message: user.Username + " has been added"});
        }
        else {
            return res.render('pages/moderators', {username: req.session.username, groupinfo: group, mod: isMod, modsinfo: groupmods,
                message: user.Username + " is already a moderator"});
        }
    }
    else {
        return res.render('pages/moderators', {username: req.session.username, groupinfo: group, mod: isMod, modsinfo: groupmods,
            message: "User does not exist"});
    }
});

router.post('/:groupname/leave', auth.isAuthenticated, async (req, res) => {
    const group = await req.db.get(SQL`SELECT * FROM \`Group\` WHERE LOWER(GroupName) = LOWER(${req.params.groupname})`);
    const moderator = await req.db.get(SQL`SELECT * FROM Moderates WHERE ModUsername = ${req.session.username} AND LOWER(GroupName) = LOWER(${req.params.groupname})`);
    const groupmods = await req.db.all(SQL`SELECT * FROM Moderates WHERE LOWER(GroupName) = LOWER(${req.params.groupname})`);

    // being a moderator gives you more privileges
    var isMod = 0;
    if (moderator) {
        isMod = 1;
    }

    if (groupmods.length > 1) {
        await req.db.run(SQL`DELETE FROM Moderates WHERE ModUsername = ${req.session.username} AND LOWER(GroupName) = LOWER(${req.params.groupname})`);

        // if user isn't moderating anything anymore delete them from moderators
        const moderating = await req.db.get(SQL`
            SELECT * FROM Moderates
            WHERE ModUsername = ${req.session.username}`);
        if (!moderating) {
            await req.db.run(SQL`DELETE FROM Moderator WHERE ModUsername = ${req.session.username}`);
        }
        res.redirect('/group/' + req.params.groupname + '/moderators');
        res.end()
    }
    else {
        return res.render('pages/moderators', {username: req.session.username, groupinfo: group, mod: isMod, modsinfo: groupmods,
            message2: "Cannot leave as you are the only moderator"});
    }
});

router.get('/:groupname/post', auth.isAuthenticated, async (req, res) => {
    const newMod = req.body.add_moderator;

    const group = await req.db.get(SQL`SELECT * FROM \`Group\` WHERE LOWER(GroupName) = LOWER(${req.params.groupname})`);

    if (!group) {
        return res.redirect('/');
    }

    res.render('pages/newpost', {username: req.session.username, groupinfo: group});
});

router.post('/:groupname/post', auth.isAuthenticated, async (req, res) => {
    const group = await req.db.get(SQL`SELECT * FROM \`Group\` WHERE LOWER(GroupName) = LOWER(${req.params.groupname})`);
    if (!group) {
        return res.redirect('/');
    }

    const title = req.body.title, body = req.body.body, nsfw = !!req.body.nsfw;

    const ipInfo = await ipApi.getIpInfo(req.connection.remoteAddress);

    let message;

    if (body.length > 5000) {
        message = 'Body message is too long, must be at most 5000 chars';
    } else if (title.length > 25) {
        message = 'Title is too long, must be at most 25 chars';
    } else if (title.length <= 3) {
        message = 'You must have a title with more than 3 characters';
    } else if (!ipInfo) {
        message = 'Failed to retrieve info for your country of origin, please try again later';
    }

    if (message) {
        return res.render('pages/newpost', {message, title, body, nsfw, username: req.session.username, groupinfo: group});
    }

    await req.db.run(SQL`INSERT OR IGNORE INTO country VALUES (${ipInfo.country})`);

    await req.db.run(SQL`INSERT INTO 
        Post(CreatorUsername, AssociatedGroup, LikeCount, Title, Bodytext, IsNFSW, CountryOfOrigin) 
        VALUES(${req.session.username}, ${req.params.groupname}, 0, ${title}, ${body}, ${nsfw}, ${ipInfo.country})`);

    res.redirect(`/group/${req.params.groupname}`);
});

router.post("/:groupname/delete", auth.isAuthenticated, async (req, res) => {
    await req.db.run(SQL`DELETE FROM \`Group\` WHERE GroupName = ${req.params.groupname}`);

    // If any users don't have any groups they're moderating anymore after deletion
    // drop them from the list of moderators.
    const uselessMods = await req.db.all(SQL`
        SELECT * FROM Moderator AS m
        WHERE NOT EXISTS (
            SELECT * FROM Moderates
            WHERE ModUsername = m.ModUsername
        )
    `);
    for (var i = 0; i < uselessMods.length; i++) {
        await req.db.run(SQL`DELETE FROM Moderator WHERE ModUsername = ${uselessMods[i].ModUsername}`);
    }
    res.redirect('/explore');
});

module.exports = router;
