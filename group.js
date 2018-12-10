const SQL = require('sql-template-strings');

const express = require('express');
const router = express.Router();
const auth = require('./auth');
const ipApi = require('./ip-api');

router.param('groupname', async function(req, res, next, groupname) {
  const group = await req.db.get(SQL`SELECT * FROM \`Group\` WHERE LOWER(GroupName) = LOWER(${groupname})`);

  if (!group) {
    return res.render('pages/generic', { username: req.session.username, messageH: 'Group cannot be found' });
  }

  req.group = group;

  // Get mod status for this group and this user
  req.isMod = !!(await req.db.get(SQL`
        SELECT * FROM Moderates WHERE
           ModUsername = ${req.session.username} AND LOWER(GroupName) = LOWER(${req.params.groupname})`));

  // Get subscribed status for this group and this user
  req.isSubscribed = !!(await req.db.get(SQL`
            SELECT * FROM SubscribedTo WHERE
                SubscriberUsername = ${req.session.username} AND LOWER(GroupName) = LOWER(${req.params.groupname})`));

  next();
});

router.param('postId', async function(req, res, next, postId) {
  const post = await req.db.get(SQL`
            SELECT *, (SELECT Type FROM PostVote
                            WHERE AssociatedPost = PostID AND VoterUsername = ${req.session.username}
                      ) AS MyVote
            FROM Post WHERE PostID = ${postId}`);

  if (!post) {
    return res.render('pages/generic', { username: req.session.username, messageH: 'Post cannot be found' });
  }

  req.post = post;
  next();
});

router.get('/create', auth.isAuthenticated, async (req, res) => {
  res.render('pages/creategroup', { username: req.session.username });
});

router.post('/create', auth.isAuthenticated, async (req, res) => {
  const groupname = req.body.create_groupname;
  const description = req.body.create_description;

  let message;

  if (groupname.length < 1 || groupname.length > 25) {
    message = 'Group name must be between 1 and 25 characters';
  } else if (/[^A-Za-z0-9\d]/.test(groupname)) {
    message = 'Only alphanumeric characters allowed in group names';
  } else if (description.length < 1) {
    message = 'Please add a description to your group';
  } else if (description.length > 5000) {
    message = 'Description is over 5000 characters';
  }

  if (message) {
    return res.render('pages/creategroup', { username: req.session.username, message, name: groupname });
  }

  // Check if group already exists
  const group = await req.db.get(SQL`SELECT * FROM \`Group\` WHERE LOWER(GroupName) = LOWER(${groupname})`);
  if (group) {
    return res.render('pages/creategroup', {
      username: req.session.username,
      message: 'Group name is taken',
      name: groupname,
    });
  }

  // Creator automatically becomes a mod
  await req.db.run(SQL`INSERT INTO \`Group\` VALUES(${groupname}, ${description}, ${req.session.username})`);
  await req.db.run(SQL`INSERT OR IGNORE INTO Moderator VALUES(${req.session.username})`);
  await req.db.run(SQL`INSERT INTO Moderates VALUES(${req.session.username}, ${groupname})`);


  res.redirect('/group/' + groupname);
});

router.post('/:groupname/subscribe', auth.isAuthenticated, async (req, res) => {
  await req.db.run(SQL`INSERT OR IGNORE INTO SubscribedTo VALUES(${req.session.username}, ${req.params.groupname})`);

  res.redirect('/group/' + req.params.groupname);
});

router.post('/:groupname/unsubscribe', auth.isAuthenticated, async (req, res) => {
  await req.db.run(SQL`DELETE FROM SubscribedTo WHERE
                        SubscriberUsername = ${req.session.username} AND GroupName = ${req.params.groupname}`);

  res.redirect('/group/' + req.params.groupname);
});

router.get('/:groupname', auth.isAuthenticated, async (req, res) => {
  res.redirect('/group/' + req.params.groupname + '/page/1')
});

router.get('/:groupname/page/:pageNo', auth.isAuthenticated, async (req, res) => {
  const hideNSFW = await req.db.get(SQL`SELECT HideNSFW FROM UserSettings WHERE Username = ${req.session.username}`);
  var allowNSFW = 0;
  if (!hideNSFW) {
    allowNSFW = 1
  }
  else {
    allowNSFW = (hideNSFW.HideNSFW + 1) % 2
  }

  const offset = (Number(req.params.pageNo) - 1) * 10;
  const postCount = await req.db.get(SQL`SELECT COUNT(*) as count FROM Post WHERE
                                      AssociatedGroup = ${req.params.groupname}
                                      AND (IsNFSW = 0 OR IsNFSW = ${allowNSFW})
                                      `);
  const numPages = Math.ceil(parseFloat(postCount.count) / 10);

  // Get list of posts
  const posts = await req.db.all(SQL`SELECT * FROM Post WHERE
                                        AssociatedGroup = ${req.params.groupname}
                                        AND (IsNFSW = 0 OR IsNFSW = ${allowNSFW})
                                     ORDER BY PostDate DESC LIMIT 10 OFFSET ${offset}`);

  res.render('pages/group', {
    username: req.session.username,
    groupinfo: req.group,
    mod: req.isMod,
    subscribed: req.isSubscribed,
    posts,
    page: req.params.pageNo,
    numPages
  });
});

router.get('/:groupname/moderators', auth.isAuthenticated, async (req, res) => {
  const groupMods = await req.db.all(SQL`SELECT * FROM Moderates WHERE
                                            LOWER(GroupName) = LOWER(${req.params.groupname})`);

  res.render('pages/moderators', {
    username: req.session.username,
    groupinfo: req.group,
    mod: req.isMod,
    modsinfo: groupMods,
  });
});

router.post('/:groupname/moderators', auth.isAuthenticated, async (req, res) => {
  const newMod = req.body.add_moderator;

  let groupMods = await req.db.all(SQL`SELECT * FROM Moderates WHERE
                                          LOWER(GroupName) = LOWER(${req.params.groupname})`);

  // Check if potential mod exists
  const user = await req.db.get(SQL`SELECT * FROM User WHERE LOWER(Username) = LOWER(${newMod})`);

  // Check if user is already a mod
  const alreadyMod = await req.db.get(SQL`SELECT * FROM Moderates WHERE
                                                LOWER(ModUsername) = LOWER(${newMod}) AND
                                                LOWER(GroupName) = LOWER(${req.params.groupname})`);

  if (!user) {
    return res.render('pages/moderators', {
      username: req.session.username,
      groupinfo: req.group,
      mod: req.isMod,
      modsinfo: groupMods,
      message: 'User does not exist',
    });
  }

  if (alreadyMod) {
    return res.render('pages/moderators', {
      username: req.session.username,
      groupinfo: req.group,
      mod: req.isMod,
      modsinfo: groupMods,
      message: `${user.Username} is already a moderator`,
    });
  } else {
    await req.db.run(SQL`INSERT INTO Moderates VALUES(${user.Username}, ${req.params.groupname})`);

    // Refresh group mods list
    groupMods = await req.db.all(SQL`SELECT * FROM Moderates WHERE LOWER(GroupName) = LOWER(${req.params.groupname})`);

    return res.render('pages/moderators', {
      username: req.session.username,
      groupinfo: req.group,
      mod: req.isMod,
      modsinfo: groupMods,
      message: `${user.Username} has been added`,
    });
  }
});

router.post('/:groupname/leave', auth.isAuthenticated, async (req, res) => {
  const groupMods = await req.db.all(SQL`SELECT * FROM Moderates WHERE
                                            LOWER(GroupName) = LOWER(${req.params.groupname})`);

  if (groupMods.length > 1) {
    await req.db.run(SQL`DELETE FROM Moderates WHERE
                            ModUsername = ${req.session.username} AND
                            LOWER(GroupName) = LOWER(${req.params.groupname})`);

    // if user isn't moderating anything anymore delete them from moderators
    const isModerating = await req.db.get(SQL`
            SELECT * FROM Moderates
            WHERE ModUsername = ${req.session.username}`);
    if (!isModerating) {
      await req.db.run(SQL`DELETE FROM Moderator WHERE ModUsername = ${req.session.username}`);
    }
    res.redirect(`/group/${req.params.groupname}/moderators`);
  } else {
    return res.render('pages/moderators', {
      username: req.session.username,
      groupinfo: req.group,
      mod: req.isMod,
      modsinfo: groupMods,
      message2: 'Cannot leave as you are the only moderator',
    });
  }
});

router.get('/:groupname/post', auth.isAuthenticated, async (req, res) => {
  res.render('pages/newpost', { username: req.session.username, subscribed: req.isSubscribed, groupinfo: req.group });
});

router.post('/:groupname/post', auth.isAuthenticated, async (req, res) => {
  const title = req.body.title;
  const body = req.body.body;
  const nsfw = !!req.body.nsfw;

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
    return res.render('pages/newpost', {
      message,
      title,
      body,
      nsfw,
      username: req.session.username,
      groupinfo: req.group,
    });
  }

  await req.db.run(SQL`INSERT OR IGNORE INTO country VALUES (${ipInfo.country})`);

  const post = await req.db.run(SQL`INSERT INTO
        Post(CreatorUsername, AssociatedGroup, LikeCount, Title, Bodytext, IsNFSW, CountryOfOrigin)
        VALUES(${req.session.username}, ${req.params.groupname}, 1, ${title}, ${body}, ${nsfw}, ${ipInfo.country})`);

  // Automatically upvote their own post
  await req.db.run(SQL`INSERT INTO PostVote (AssociatedPost, VoterUsername, Type)
                             VALUES (${post.lastID}, ${req.session.username}, 1)`);

  res.redirect(`/group/${req.params.groupname}`);
});

router.post('/:groupname/delete', auth.isAuthenticated, async (req, res) => {
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
  for (let i = 0; i < uselessMods.length; i++) {
    await req.db.run(SQL`DELETE FROM Moderator WHERE ModUsername = ${uselessMods[i].ModUsername}`);
  }
  res.redirect('/explore');
});

router.get('/:groupname/:postId', auth.isAuthenticated, async (req, res) => {
  const comments = await req.db.all(SQL`
            SELECT *, (SELECT Type FROM CommentVote
                            WHERE AssociatedComment = CommentID AND VoterUsername = ${req.session.username}
                      ) AS MyVote
            FROM Comment WHERE AssociatedPost = ${req.post.PostID} ORDER BY LikeCount DESC`);

  return res.render('pages/post', {
    username: req.session.username,
    groupinfo: req.group,
    mod: req.isMod,
    subscribed: req.isSubscribed,
    post: req.post,
    comments,
  });
});

router.post('/:groupname/:postId/comment', auth.isAuthenticated, async (req, res) => {
  if (req.body.body.length > 2000) {
    return;
  }

  const comment = await req.db.run(SQL`INSERT INTO
        Comment(BodyText, CreatorUsername, AssociatedPost, LikeCount)
        VALUES(${req.body.body}, ${req.session.username}, ${req.post.PostID}, 1)`);

  // Automatically upvote their own comment
  await req.db.run(SQL`INSERT INTO CommentVote (AssociatedComment, VoterUsername, Type)
                             VALUES (${comment.lastID}, ${req.session.username}, 1)`);

  res.redirect(`/group/${req.params.groupname}/${req.params.postId}`);
});

router.post('/:groupname/:postId/vote', auth.isAuthenticated, async (req, res) => {
  const type = req.body.type;

  if (![-1, 0, 1].includes(type)) {
    return res.status(500).json({ msg: 'Invalid vote type' });
  }

  // Get if they already have a vote
  const vote = await req.db.get(SQL`SELECT * FROM PostVote WHERE
                                        AssociatedPost = ${req.params.postId} AND
                                        VoterUsername = ${req.session.username}`);

  // Update the vote type or insert it if it doesn't exist
  await req.db.run(SQL`INSERT OR REPLACE INTO PostVote (AssociatedPost, VoterUsername, Type)
                             VALUES (${req.params.postId}, ${req.session.username}, ${type})`);

  // Figure out what the new total like amount is
  let offset = 0;

  if (vote) {
    // Negate previous vote
    offset -= vote.Type;
  }

  offset += type;

  await req.db.run(SQL`UPDATE Post SET LikeCount = LikeCount + ${offset} WHERE PostID = ${req.params.postId}`);

  res.json({ msg: 'Successfully voted!', offset });
});

module.exports = router;
