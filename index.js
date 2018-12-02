const SQL = require("sql-template-strings");

const express = require('express');
const bcrypt = require('bcrypt');
const Promise = require('bluebird');
const sqlite = require('sqlite');
const config = require('./config');
const session = require('express-session');
const bodyParser = require('body-parser');

if (!config.session.secret) {
    throw new Error('You must fill in the session secret in the config')
}

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine', 'ejs');
app.use(session(Object.assign({
    resave: false,
    saveUninitialized: true,
}, config.session)));

const isAuthenticated = function(req, res, next) {
    // Redirect to login if they aren't logged in
    if (!req.session.username) {
        res.redirect('/login');
    } else {
        next();
    }
};

let db;

async function main() {
    const port = process.env.PORT || 3000;
    db = await sqlite.open('./db.sqlite', { cached: true, Promise }).then(db => db.migrate());
    app.listen(port);

    // This query activates foreign constraints
    await db.run(SQL`PRAGMA foreign_keys = ON`);

    console.log(`Listening on port ${port}: http://localhost:${port}`);
}

app.get('/', isAuthenticated, async (req, res) => {
    res.render('pages/index', {username: req.session.username});    // send username for the header to display name
});

app.get('/settings', isAuthenticated, async (req, res, next) => {
    const settings = await db.get(SQL`SELECT * FROM UserSettings WHERE Username = ${req.session.username}`);
    res.render('pages/settings', {username: req.session.username, flag: settings && settings.HideNSFW});
});

app.post("/settings", isAuthenticated, async (req, res) => {
    // Note: Boolean("false") -> True, we must do this comparison
    const newHideNsfw = req.body.hideNSFW === "on";
    console.log(newHideNsfw);
    await db.run(SQL`INSERT INTO UserSettings (Username, HideNSFW) VALUES (${req.session.username}, ${newHideNsfw})
                    ON CONFLICT(Username) DO UPDATE SET HideNSFW = ${newHideNsfw}`);
    res.redirect('/');
});

app.post("/deleteaccount", isAuthenticated, async (req, res) => {
    // make sure mods can't delete account
    const moderator = await db.get(SQL`SELECT * FROM Moderator WHERE ModUsername = ${req.session.username}`);

    if (moderator) {
        const settings = await db.get(SQL`SELECT * FROM UserSettings WHERE Username = ${req.session.username}`);
        return res.render('pages/settings', {username: req.session.username, flag: settings && settings.HideNSFW,
            message: "Cannot delete account because you are a mod of a group. Leave all your groups first."});
    }
    else {
        await db.run(SQL`DELETE FROM User WHERE Username = ${req.session.username}`);
        req.session.destroy((err) => {
            if (err) throw err;
            res.redirect('/signup');
        });
    }
});

app.get("/login", async (req, res) => {
    res.render('pages/login');
});

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    // we want the username to be case insensitive
    const user = await db.get(SQL`SELECT * FROM User WHERE LOWER(Username) = LOWER(${username})`);

    if (user && await bcrypt.compare(password, user.Password)) {
        // username/password pair exists
        req.session.username = user.Username;
        res.redirect('/');
    } else {
        res.render('pages/login', {message: "Incorrect username or password!", name: username});
    }
});

app.get("/logout", async (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect('/login');
    });
});

app.get("/signup", async (req, res) => {
    res.render('pages/signup', {});
});

app.post("/signup", async (req, res) => {
    const username = req.body.create_username;
    const password = req.body.create_password;
    const confirmPassword = req.body.confirm_password;

    if (password !== confirmPassword) {
        return res.render('pages/signup', {message: "Passwords don't match", name: username});
    }
    if (username.length < 1 || username.length > 25) {
        return res.render('pages/signup', {message: "Invalid username", name: username});
    }
    if (/[^A-Za-z\d]/.test(username)) {
        return res.render('pages/signup', {message: "Only alphanumeric characters allowed in username", name: username});
    }
    if (password.length < 8) {
        return res.render('pages/signup', {message: "Password must be at least 8 characters long", name: username});
    }

    // Check if someone already has this username
    const user = await db.get(SQL`SELECT * FROM User WHERE LOWER(Username) = LOWER(${username})`);

    if (user) {
        return res.render('pages/signup', {message: "Username already taken", name: username});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.run(SQL`INSERT INTO User VALUES(${username}, ${hashedPassword})`);

    req.session.username = username;
    res.redirect("/");
});

app.get('/user/:username', isAuthenticated, async (req, res) => {
    // check if user exists
    var theUser = req.params.username;
    console.log('Username is %s', theUser);
    const user = await db.get(SQL`SELECT * FROM User WHERE LOWER(Username) = LOWER(${req.params.username})`);
/*      const user2 = await db.get(SQL `SELECT username, CreatorUsername, Follower, SubscriberUsername
        FROM User AS U, post AS P, follows AS F, subscribedto AS S
        WHERE (LOWER(U.username) = LOWER(${req.params.username})
        AND LOWER(P.CreatorUsername) = LOWER(${req.params.username})
        AND LOWER(F.Follower) = LOWER(${req.params.username})
        AND LOWER(S.SubscriberUsername) = LOWER(${req.params.username}));`
      )*/
     // later we will add the user's posts too


    // check if logged in user is following this user's page
    var isFollowing = 0;
    const follower = await db.get(SQL`SELECT * FROM Follows WHERE follower = ${req.session.username} AND LOWER(Followee) = LOWER(${req.params.username})`);
    if (follower) {
        isFollowing = 1;
    }
    console.log('User is %s', user.toString());
    if (user) {
        return res.render('pages/user/' + theUser.toString(), {username: req.session.username, userinfo: user, followed: isFollowing});    }
    else {
        return res.render('pages/generic', {username: req.session.username, messageH: "User does not exist"});
    }
});

/*
app.post("/user/:username", isAuthenticated, async (req, res) => {
    var theUser = req.body.page_username;

    await db.run(SQL`INSERT INTO User (Username) VALUES (${theUser})`);
    res.redirect('/user/' + theUser);
  });
//not sure if needed, so i'll leave commented out
  */

app.post("/follow", isAuthenticated, async (req, res) => {
    await db.run(SQL`INSERT INTO Follows VALUES(${req.session.username}, ${req.body.page_username})`);

    res.redirect('/user/' + req.body.page_username);
});

app.post("/unfollow", isAuthenticated, async (req, res) => {
    await db.run(SQL`DELETE FROM Follows WHERE Follower = ${req.session.username} AND Followee = ${req.body.page_username}`);

    res.redirect('/user/' + req.body.page_username);
});

app.get('/explore', isAuthenticated, async (req, res) => {
    const groupnames = await db.all(SQL`SELECT GroupName FROM \`Group\``);
    res.render('pages/explore', {username: req.session.username, groups: groupnames});
});

app.get('/group/:groupname', isAuthenticated, async (req, res) => {
    const group = await db.get(SQL`SELECT * FROM \`Group\` WHERE LOWER(GroupName) = LOWER(${req.params.groupname})`);
    const moderator = await db.get(SQL`SELECT * FROM Moderates WHERE ModUsername = ${req.session.username} AND LOWER(GroupName) = LOWER(${req.params.groupname})`);
    // later we will add the group's posts too

    // being a moderator gives you more privileges
    var isMod = 0;
    if (moderator) {
        isMod = 1;
    }

    // check if user is subscribed or not
    var isSubscribed = 0;
    const subscriber = await db.get(SQL`SELECT * FROM SubscribedTo WHERE SubscriberUsername = ${req.session.username} AND LOWER(GroupName) = LOWER(${req.params.groupname})`);
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

app.post("/subscribe", isAuthenticated, async (req, res) => {
    await db.run(SQL`INSERT INTO SubscribedTo VALUES(${req.session.username}, ${req.body.groupname})`);

    res.redirect('/group/' + req.body.groupname);
});

app.post("/unsubscribe", isAuthenticated, async (req, res) => {
    await db.run(SQL`DELETE FROM SubscribedTo WHERE SubscriberUsername = ${req.session.username} AND GroupName = ${req.body.groupname}`);

    res.redirect('/group/' + req.body.groupname);
});

app.get('/group/:groupname/moderators', isAuthenticated, async (req, res) => {
    const group = await db.get(SQL`SELECT * FROM \`Group\` WHERE LOWER(GroupName) = LOWER(${req.params.groupname})`);
    const moderator = await db.get(SQL`SELECT * FROM Moderates WHERE ModUsername = ${req.session.username} AND LOWER(GroupName) = LOWER(${req.params.groupname})`);
    const groupmods = await db.all(SQL`SELECT * FROM Moderates WHERE LOWER(GroupName) = LOWER(${req.params.groupname})`);

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

app.post('/group/:groupname/moderators', isAuthenticated, async (req, res) => {
    const newMod = req.body.add_moderator;

    const group = await db.get(SQL`SELECT * FROM \`Group\` WHERE LOWER(GroupName) = LOWER(${req.params.groupname})`);
    const moderator = await db.get(SQL`SELECT * FROM Moderates WHERE ModUsername = ${req.session.username} AND LOWER(GroupName) = LOWER(${req.params.groupname})`);
    var groupmods = await db.all(SQL`SELECT * FROM Moderates WHERE LOWER(GroupName) = LOWER(${req.params.groupname})`);

    // being a moderator gives you more privileges
    var isMod = 0;
    if (moderator) {
        isMod = 1;
    }

    // Check if user exists
    const user = await db.get(SQL`SELECT * FROM User WHERE LOWER(Username) = LOWER(${newMod})`);

    // Check if user is already a mod
    const alreadyMod = await db.get(SQL`SELECT * FROM Moderates WHERE LOWER(ModUsername) = LOWER(${newMod}) AND LOWER(GroupName) = LOWER(${req.params.groupname})`);

    if (user) {
        if (!alreadyMod) {
            await db.run(SQL`INSERT INTO Moderates VALUES(${user.Username}, ${req.params.groupname})`);
            groupmods = await db.all(SQL`SELECT * FROM Moderates WHERE LOWER(GroupName) = LOWER(${req.params.groupname})`);
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

app.post('/group/:groupname/leave', isAuthenticated, async (req, res) => {
    const group = await db.get(SQL`SELECT * FROM \`Group\` WHERE LOWER(GroupName) = LOWER(${req.params.groupname})`);
    const moderator = await db.get(SQL`SELECT * FROM Moderates WHERE ModUsername = ${req.session.username} AND LOWER(GroupName) = LOWER(${req.params.groupname})`);
    const groupmods = await db.all(SQL`SELECT * FROM Moderates WHERE LOWER(GroupName) = LOWER(${req.params.groupname})`);

    // being a moderator gives you more privileges
    var isMod = 0;
    if (moderator) {
        isMod = 1;
    }

    if (groupmods.length > 1) {
        await db.run(SQL`DELETE FROM Moderates WHERE ModUsername = ${req.session.username} AND LOWER(GroupName) = LOWER(${req.params.groupname})`);

        // if user isn't moderating anything anymore delete them from moderators
        const moderating = await db.get(SQL`
            SELECT * FROM Moderates
            WHERE ModUsername = ${req.session.username}`);
        if (!moderating) {
            await db.run(SQL`DELETE FROM Moderator WHERE ModUsername = ${req.session.username}`);
        }
        res.redirect('/group/' + req.params.groupname + '/moderators');
        res.end()
    }
    else {
        return res.render('pages/moderators', {username: req.session.username, groupinfo: group, mod: isMod, modsinfo: groupmods,
            message2: "Cannot leave as you are the only moderator"});
    }
});

app.post("/deletegroup", isAuthenticated, async (req, res) => {
    await db.run(SQL`DELETE FROM \`Group\` WHERE GroupName = ${req.body.groupname}`);

    // If any users don't have any groups they're moderating anymore after deletion
    // drop them from the list of moderators.
    const uselessMods = await db.all(SQL`
    SELECT * FROM Moderator AS m
    WHERE NOT EXISTS (
        SELECT * FROM Moderates
        WHERE ModUsername = m.ModUsername
    )`);
    for (var i = 0; i < uselessMods.length; i++) {
        await db.run(SQL`DELETE FROM Moderator WHERE ModUsername = ${uselessMods[i].ModUsername}`);
    }
    res.redirect('/explore');
});

app.get('/creategroup', isAuthenticated, async (req, res) => {
    res.render('pages/creategroup', {username: req.session.username});
});

app.post("/creategroup", isAuthenticated, async (req, res) => {
    const groupname = req.body.create_groupname;
    const description = req.body.create_description;

    if (groupname.length < 1 || groupname.length > 25) {
        return res.render('pages/creategroup', {username: req.session.username, message: "Group name must be between 1 and 25 characters", name: groupname});
    }
    if (/[^A-Za-z\d]/.test(groupname)) {
        return res.render('pages/creategroup', {username: req.session.username, message: "Only alphanumeric characters allowed in group names", name: groupname});
    }
    if (description.length < 1) {
        return res.render('pages/creategroup', {username: req.session.username, message: "Please add a description to your group", name: groupname});
    }
    if (description.length > 5000) {
        return res.render('pages/creategroup', {username: req.session.username, message: "Description is over 5000 characters", name: groupname});
    }

    // Check if group already exists
    const group = await db.get(SQL`SELECT * FROM \`Group\` WHERE LOWER(GroupName) = LOWER(${groupname})`);
    if (group) {
        return res.render('pages/creategroup', {username: req.session.username, message: "Group name is taken", name: groupname});
    }

    // Creator automatically becomes a mod
    await db.run(SQL`INSERT INTO \`Group\` VALUES(${groupname}, ${description}, ${req.session.username})`);
    await db.run(SQL`INSERT OR IGNORE INTO Moderator VALUES(${req.session.username})`);
    await db.run(SQL`INSERT INTO Moderates VALUES(${req.session.username}, ${groupname})`);

    res.redirect("/group/" + groupname);
});

app.get('/inbox', isAuthenticated, async (req, res) => {
    res.redirect('/inbox/1');
});

app.get('/inbox/:pageNo', isAuthenticated, async (req, res) => {
    const offset = (Number(req.params.pageNo) - 1) * 10;
    const countMail = await db.get(SQL`SELECT COUNT(*) as count FROM Mail WHERE Receiver = ${req.session.username}`)
    const numPages = Math.ceil(parseFloat(countMail.count) / 10)

    const mail = await db.all(SQL`SELECT * FROM Mail WHERE Receiver = ${req.session.username} ORDER BY MailID DESC LIMIT 10 OFFSET ${offset}`);
    res.render('pages/inbox', {username: req.session.username, mailpile: mail, page: req.params.pageNo, totalPages: numPages});
});

app.get('/compose', isAuthenticated, async (req, res) => {
    res.render('pages/compose', {username: req.session.username, recipient: req.query.sendto});
});

app.post("/compose", isAuthenticated, async (req, res) => {
    const recipient = req.body.recipient;
    const subject = req.body.subject;
    const message_body = req.body.message_body;

    if (subject.length > 25) {
        return res.render('pages/compose', {username: req.session.username, message: "Subject is too big",
            recipient: recipient, subject: subject, body: message_body});
    }
    if (message_body > 5000) {
        return res.render('pages/compose', {username: req.session.username, message: "Message exceeds 5000 characters",
            recipient: recipient, subject: subject, body: message_body});
    }

    // check if recipient exists
    const user = await db.get(SQL`SELECT * FROM User WHERE LOWER(Username) = LOWER(${recipient})`);
    if (user) {
        await db.run(`INSERT INTO Mail VALUES (NULL, \'${subject}\', \'${message_body}\', \'${req.session.username}\', \'${user.Username}\')`);
        return res.render('pages/generic', {username: req.session.username, messageH: "Success!", messageP: "Your message has been sent."});
    }
    else {
        return res.render('pages/compose', {username: req.session.username, message: "Username does not exist",
            recipient: recipient, subject: subject, body: message_body});
    }
});

app.get('/mail/:id', isAuthenticated, async (req, res) => {
    const mailID = req.params.id;
    // Check if mail exists and belongs to the user that is signed in
    const mail = await db.get(SQL`SELECT * FROM Mail WHERE Receiver = ${req.session.username} AND MailID = ${mailID}`);

    if (!mail) {
        return res.render('pages/generic', {username: req.session.username, messageP: "You are not authorized to view this page"});
    }
    else {
        return res.render('pages/mail', {username: req.session.username, mail: mail});
    }

});

app.post("/deletemail", isAuthenticated, async (req, res) => {
    await db.run(SQL`DELETE FROM Mail WHERE MailID = ${req.body.mailID}`);
    res.redirect('/inbox/1');
});







main();
