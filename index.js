const SQL = require("sql-template-strings");

const express = require('express');
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
    await db.run(SQL`DELETE FROM User WHERE Username = ${req.session.username}`);
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect('/signup');
    });
});

app.get("/login", async (req, res) => {
    res.render('pages/login');
});

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    // we want the username to be case insensitive
    const user = await db.get(SQL`SELECT * FROM User WHERE LOWER(Username) = LOWER(${username}) AND Password = ${password}`);

    if (user) {
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

    await db.run(SQL`INSERT INTO User VALUES(${username}, ${password})`);

    req.session.username = username;
    res.redirect("/");
});

main();
