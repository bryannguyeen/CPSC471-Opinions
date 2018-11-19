const express = require('express');
const Promise = require('bluebird');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const config = require('./config');
const ejs = require('ejs');
const session = require('express-session');
const bodyParser = require('body-parser');

const db = new sqlite3.Database('db.sqlite');

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

const port = process.env.PORT || 3000;
const dbPromise = sqlite.open('./db.sqlite', { cached: true, Promise }).then(db => db.migrate());


app.get('/', async (req, res, next) => {
    if (!req.session.username) {
        res.redirect('/login');
        res.end();
    }
    else {
        res.render('pages/index', {username: req.session.username});    // send username for the header to display name
    }

    /*
    try {
        const db = await dbPromise;
        const [post, categories] = await Promise.all([
            db.get('SELECT * FROM Post WHERE id = ?', req.params.id),
            db.all('SELECT * FROM Category')
        ]);
        res.render('post', { post, categories });
    } catch (err) {
        next(err);
    } */
});

app.get('/settings', async (req, res, next) => {
    if (!req.session.username) {
        res.redirect('/login');
        res.end();
    }
    else {
        // get the existing usersettings, which is just the nsfw flag
        const query = 'SELECT HideNSFW FROM UserSettings WHERE Username = \'' + req.session.username + '\'';
        db.all(query, (err, rows) => {
            res.render('pages/settings', {username: req.session.username, flag: rows[0].HideNSFW});
        });
    }
});

app.post("/savesettings", async (req, res) => {
    const hidensfwNew = Boolean(req.body.hideNSFW);

    const query = 'UPDATE UserSettings SET HideNSFW = ' + hidensfwNew + ' WHERE Username = \''+ req.session.username + '\'';
    db.all(query, (err) => {
        if (err) throw err;
        res.redirect('/');
        res.end();
    });
})

app.post("/deleteaccount", async (req, res) => {
    const query = 'DELETE FROM User WHERE Username = \''+ req.session.username + '\'';
    db.all(query, (err) => {
        if (err) throw err;
        req.session.destroy((err) => {
            if (err) throw err;
            res.redirect('/signup');
            res.end();
        })
    });
})

app.get("/login", async (req, res) => {
    // Lists all the existing users in the database and their settings
    db.all('SELECT * FROM User;', (err, rows) => {
        console.log(rows);
    });
    db.all('SELECT * FROM UserSettings;', (err, rows) => {
        console.log(rows);
    });

    var errorMessage = "";
    var defaultUsername = "";
    if (req.query.invalid) {
        errorMessage = "Incorrect username or password";
    }
    if (req.query.name) {
        defaultUsername = req.query.name;
    }
    res.render('pages/loginpage', {message: errorMessage, name: defaultUsername});
})

app.post("/authentication", async (req, res) => {
    console.log("logging in...");
    const username = req.body.username;
    const password = req.body.password;
    // we want the username to be case insensitive
    const query = 'SELECT * FROM User WHERE LOWER(Username) = LOWER(\'' + username + '\') AND Password = \'' + password + '\'';
    db.all(query, (err, rows) => {
        if (rows.length) { // length is 1 if such a username/password pair exists, 0 otherwise
            console.log("Success! ");
            req.session.username = rows[0].Username;
            res.redirect('/');
        }
        else {
            console.log("Wrong username/password!");
            res.redirect('/login?invalid=true&name=' + username);
        }
        res.end();
    });
})

app.get("/logout", async (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect('/login');
        res.end();
    })
})

app.get("/signup", async (req, res) => {
    var errorMessage = "";
    var defaultUsername = "";
    if (req.query.invalid == "nomatch") {
        errorMessage = "Passwords do not match";
    }
    if (req.query.invalid == "emptyusername") {
        errorMessage = "Username can't be empty";
    }
    if (req.query.invalid == "longusername") {
        errorMessage = "Username cannot exceed 25 characters";
    }
    if (req.query.invalid == "tooshort") {
        errorMessage = "Password must be at least 8 characters";
    }
    if (req.query.invalid == "toolong") {
        errorMessage = "Password cannot exceed 25 characters";
    }
    if (req.query.invalid == "taken") {
        errorMessage = "Username is already taken";
    }
    if (req.query.name) {
        defaultUsername = req.query.name;
    }
    res.render('pages/signuppage', {message: errorMessage, name: defaultUsername});
})

app.post("/accountcreation", (req, res) => {
    console.log("trying to create user...");

    // This is the information retrieved from the signup page
    const username = req.body.create_username;
    const password = req.body.create_password;
    const confirmPassword = req.body.confirm_password;

    console.log("Username: " + username);
    console.log("Password: " + password);
    console.log("Confirm Password: " + confirmPassword);

    // username is empty
    if (String(username).length < 1) {
        console.log("Username is empty!");
        res.redirect('/signup?invalid=emptyusername&name=' + username);
        return;
    } else {
        console.log("Username is not empty!")
    }

    // username is too long
    if (String(username).length > 25) {
        console.log("Username is too long!");
        res.redirect('/signup?invalid=longusername&name=' + username);
        return;
    } else {
        console.log("Username is not too long!")
    }

    // username contains an invalid character
    // CODE HERE

    // passwords don't match
    if (password != confirmPassword) {
        console.log("Passwords don't match!");
        res.redirect('/signup?invalid=nomatch&name=' + username);
        return;
    }
    else {
        console.log("Paswords match!");
    }

    // password is too short
    if (String(password).length < 8) {
        console.log("Password is too short!");
        res.redirect('/signup?invalid=tooshort&name=' + username);
        return;
    } else {
        console.log("Password is not too short!")
    }

    // password is too long
    if (String(password).length > 25) {
        console.log("Password is too long!");
        res.redirect('/signup?invalid=toolong&name=' + username);
        return;
    } else {
        console.log("Password is not too long!")
    }

    // if they pass all conditions, create the account and log the user in
    const query1 = 'INSERT INTO User VALUES(\'' + username + '\', \'' + password + '\')';
    db.run(query1, (err) => {
        if (err && String(err.message) == 'SQLITE_CONSTRAINT: UNIQUE constraint failed: user.Username') {
            console.log("Username taken!");
            res.redirect('/signup?invalid=taken&name=' + username);
            res.end();
        }
        else {
            console.log("Username is free!");
            const query2 = 'INSERT INTO UserSettings VALUES(\'' + username + '\', \'1\')';
            // Also make the UserSetting for the associated User
            db.run(query2, (err) => {
                if (err) throw err;
                console.log("Account creation successful!");
                req.session.username = username;
                res.redirect("/");
                res.end();
            })
        }
    });

    //res.end();
})

app.listen(port);

console.log(`Listening on port ${port}`);


