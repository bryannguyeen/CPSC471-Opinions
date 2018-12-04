const SQL = require('sql-template-strings');

const express = require('express');
const bcrypt = require('bcrypt');
const Promise = require('bluebird');
const sqlite = require('sqlite');
const config = require('./config');
const session = require('express-session');
const bodyParser = require('body-parser');
const SQLiteStore = require('connect-sqlite3')(session);
const auth = require('./auth');

if (!config.session.secret) {
  throw new Error('You must fill in the session secret in the config');
}

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(session(Object.assign({
  store: new SQLiteStore(),
  resave: false,
  saveUninitialized: true,
}, config.session)));

let db;

app.use(function(req, res, next) {
  req.db = db;
  next();
});

async function main() {
  const port = process.env.PORT || 3000;
  db = await sqlite.open('./db.sqlite', {cached: true, Promise}).then((db) => db.migrate());
  app.listen(port);

  // This query activates foreign constraints
  await db.run(SQL`PRAGMA foreign_keys = ON`);

  console.log(`Listening on port ${port}: http://localhost:${port}`);
}

app.use('/group', require('./group'));


app.get('/', auth.isAuthenticated, async (req, res) => {
  // Get 10 most recent posts from groups the user is subscribed to
  const posts = await req.db.all(SQL`
            SELECT * FROM Post WHERE
                EXISTS(SELECT * FROM SubscribedTo
                        WHERE SubscriberUsername = ${req.session.username}
                              AND GroupName = AssociatedGroup
                      )
                ORDER BY PostDate DESC LIMIT 10`);

  res.render('pages/index', {username: req.session.username, posts});
});

app.get('/settings', auth.isAuthenticated, async (req, res, next) => {
  const settings = await db.get(SQL`SELECT * FROM UserSettings WHERE Username = ${req.session.username}`);
  res.render('pages/settings', {username: req.session.username, flag: settings && settings.HideNSFW});
});

app.post('/settings', auth.isAuthenticated, async (req, res) => {
  // Note: Boolean("false") -> True, we must do this comparison
  const newHideNsfw = req.body.hideNSFW === 'on';
  console.log(newHideNsfw);
  await db.run(SQL`INSERT INTO UserSettings (Username, HideNSFW) VALUES (${req.session.username}, ${newHideNsfw})
                    ON CONFLICT(Username) DO UPDATE SET HideNSFW = ${newHideNsfw}`);
  res.redirect('/');
});

app.post('/deleteaccount', auth.isAuthenticated, async (req, res) => {
  // make sure mods can't delete account
  const moderator = await db.get(SQL`SELECT * FROM Moderator WHERE ModUsername = ${req.session.username}`);

  if (moderator) {
    const settings = await db.get(SQL`SELECT * FROM UserSettings WHERE Username = ${req.session.username}`);
    return res.render('pages/settings', {username: req.session.username, flag: settings && settings.HideNSFW,
      message: 'Cannot delete account because you are a mod of a group. Leave all your groups first.'});
  } else {
    await db.run(SQL`DELETE FROM User WHERE Username = ${req.session.username}`);
    req.session.destroy((err) => {
      if (err) throw err;
      res.redirect('/signup');
    });
  }
});

app.get('/login', async (req, res) => {
  res.render('pages/login');
});

app.post('/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  // we want the username to be case insensitive
  const user = await db.get(SQL`SELECT * FROM User WHERE LOWER(Username) = LOWER(${username})`);

  if (user && await bcrypt.compare(password, user.Password)) {
    // username/password pair exists
    req.session.username = user.Username;
    res.redirect('/');
  } else {
    res.render('pages/login', {message: 'Incorrect username or password!', name: username});
  }
});

app.get('/logout', async (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect('/login');
  });
});

app.get('/signup', async (req, res) => {
  res.render('pages/signup', {});
});

app.post('/signup', async (req, res) => {
  const username = req.body.create_username;
  const password = req.body.create_password;
  const confirmPassword = req.body.confirm_password;

  if (password !== confirmPassword) {
    return res.render('pages/signup', {message: 'Passwords don\'t match', name: username});
  }
  if (username.length < 1 || username.length > 25) {
    return res.render('pages/signup', {message: 'Invalid username', name: username});
  }
  if (/[^A-Za-z0-9\d]/.test(username)) {
    return res.render('pages/signup', {message: 'Only alphanumeric characters allowed in username', name: username});
  }
  if (password.length < 8) {
    return res.render('pages/signup', {message: 'Password must be at least 8 characters long', name: username});
  }

  // Check if someone already has this username
  const user = await db.get(SQL`SELECT * FROM User WHERE LOWER(Username) = LOWER(${username})`);

  if (user) {
    return res.render('pages/signup', {message: 'Username already taken', name: username});
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.run(SQL`INSERT INTO User VALUES(${username}, ${hashedPassword})`);

  req.session.username = username;
  res.redirect('/');
});

let theUser;
app.get('/user/:username', auth.isAuthenticated, async (req, res) => {
  // check if user exists
  theUser = req.params.username;
  console.log('Username is %s', theUser);
  const user = await db.get(SQL`SELECT * FROM User WHERE LOWER(Username) = LOWER(${req.params.username})`);
  // later we will add the user's posts too


  // check if logged in user is following this user's page
  let isFollowing = 0;
  const follower = await db.get(SQL`
        SELECT * FROM Follows WHERE
            follower = ${req.session.username} AND LOWER(Followee) = LOWER(${req.params.username})`);
  if (follower) {
    isFollowing = 1;
  }
  console.log('User is %s', user);
  if (user) {
    return res.render('pages/user', {username: req.session.username, userinfo: user, followed: isFollowing});
  } else {
    return res.render('pages/generic', {username: req.session.username, messageH: 'User does not exist'});
  }
});

app.get('/user', auth.isAuthenticated, async (req, res) => {
  res.redirect('/user/' + theUser.toString());
});

/*
app.post("/user/:username", auth.isAuthenticated, async (req, res) => {
    var theUser = req.body.page_username;

    await db.run(SQL`INSERT INTO User (Username) VALUES (${theUser})`);
    res.redirect('/user/' + theUser);
  });
//not sure if needed, so i'll leave commented out
  */

app.post('/follow', auth.isAuthenticated, async (req, res) => {
  await db.run(SQL`INSERT INTO Follows VALUES(${req.session.username}, ${req.body.page_username})`);

  res.redirect('/user/' + req.body.page_username);
});

app.post('/unfollow', auth.isAuthenticated, async (req, res) => {
  await db.run(SQL`DELETE FROM Follows WHERE
                    Follower = ${req.session.username} AND Followee = ${req.body.page_username}`);

  res.redirect('/user/' + req.body.page_username);
});

app.get('/explore', auth.isAuthenticated, async (req, res) => {
  const groupnames = await db.all(SQL`SELECT GroupName FROM \`Group\``);
  res.render('pages/explore', {username: req.session.username, groups: groupnames});
});


app.get('/inbox', auth.isAuthenticated, async (req, res) => {
  res.redirect('/inbox/1');
});

app.get('/inbox/:pageNo', auth.isAuthenticated, async (req, res) => {
  const offset = (Number(req.params.pageNo) - 1) * 10;
  const countMail = await db.get(SQL`SELECT COUNT(*) as count FROM Mail WHERE Receiver = ${req.session.username}`);
  const numPages = Math.ceil(parseFloat(countMail.count) / 10);

  const mail = await db.all(SQL`SELECT * FROM Mail WHERE
                                Receiver = ${req.session.username}
                                ORDER BY MailID DESC
                                LIMIT 10 OFFSET ${offset}`);
  res.render('pages/inbox', {
    username: req.session.username,
    mailpile: mail,
    page: req.params.pageNo,
    totalPages: numPages,
  });
});

app.get('/compose', auth.isAuthenticated, async (req, res) => {
  res.render('pages/compose', {username: req.session.username, recipient: req.query.sendto});
});

app.post('/compose', auth.isAuthenticated, async (req, res) => {
  const recipient = req.body.recipient;
  const subject = req.body.subject;
  const message_body = req.body.message_body;

  if (subject.length > 25) {
    return res.render('pages/compose', {username: req.session.username, message: 'Subject is too big',
      recipient: recipient, subject: subject, body: message_body});
  }
  if (message_body > 5000) {
    return res.render('pages/compose', {username: req.session.username, message: 'Message exceeds 5000 characters',
      recipient: recipient, subject: subject, body: message_body});
  }

  // check if recipient exists
  const user = await db.get(SQL`SELECT * FROM User WHERE LOWER(Username) = LOWER(${recipient})`);
  if (user) {
    await db.run(`INSERT INTO Mail VALUES
                    (NULL, ${subject}, ${message_body}, ${req.session.username}, ${user.Username})`);
    return res.render('pages/generic', {
      username: req.session.username,
      messageH: 'Success!',
      messageP: 'Your message has been sent.',
    });
  } else {
    return res.render('pages/compose', {username: req.session.username, message: 'Username does not exist',
      recipient: recipient, subject: subject, body: message_body});
  }
});

app.get('/mail/:id', auth.isAuthenticated, async (req, res) => {
  const mailID = req.params.id;
  // Check if mail exists and belongs to the user that is signed in
  const mail = await db.get(SQL`SELECT * FROM Mail WHERE Receiver = ${req.session.username} AND MailID = ${mailID}`);

  if (!mail) {
    return res.render('pages/generic', {
      username: req.session.username,
      messageP: 'You are not authorized to view this page',
    });
  } else {
    return res.render('pages/mail', {username: req.session.username, mail: mail});
  }
});

app.post('/deletemail', auth.isAuthenticated, async (req, res) => {
  await db.run(SQL`DELETE FROM Mail WHERE MailID = ${req.body.mailID}`);
  res.redirect('/inbox/1');
});

app.post('/comment/:id/vote', auth.isAuthenticated, async (req, res) => {
  const type = req.body.type;

  if (![-1, 0, 1].includes(type)) {
    return res.status(500).json({msg: 'Invalid vote type'});
  }

  // Get if they already have a vote
  const vote = await req.db.get(SQL`SELECT * FROM commentvote WHERE
                                    AssociatedComment = ${req.params.id} AND VoterUsername = ${req.session.username}`);

  // Update the vote type or insert it if it doesn't exist
  await req.db.run(SQL`INSERT OR REPLACE INTO CommentVote (AssociatedComment, VoterUsername, Type)
                             VALUES (${req.params.id}, ${req.session.username}, ${type})`);


  // Figure out what the new total like amount is
  let offset = 0;

  if (vote) {
    // Negate previous vote
    offset -= vote.Type;
  }

  offset += type;

  await req.db.run(SQL`UPDATE Comment SET LikeCount = LikeCount + ${offset} WHERE CommentID = ${req.params.id}`);

  res.json({msg: 'Successfully voted!', offset});
});


main();
