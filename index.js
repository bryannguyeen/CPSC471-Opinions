const express = require('express');
const Promise = require('bluebird');
const sqlite = require('sqlite');
const config = require('./config');
const ejs = require('ejs');
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

const port = process.env.PORT || 3000;
const dbPromise = sqlite.open('./db.sqlite', { cached: true, Promise }).then(db => db.migrate());


app.get('/', async (req, res, next) => {
    res.render('pages/index');
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

app.get("/login", async (req, res) => {
    res.render('pages/loginpage');
})

app.get("/signup", async (req, res) => {
    res.render('pages/signuppage');
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
    if (password == confirmPassword) {
        console.log("Paswords match!")
    }
    else {
        console.log("Passwords don't match!")
    }
    res.end();
})

app.listen(port);

console.log(`Listening on port ${port}`);


