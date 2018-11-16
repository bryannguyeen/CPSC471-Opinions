const express = require('express');
const Promise = require('bluebird');
const sqlite = require('sqlite');
const ejs = require('ejs');

const app = express();

app.set('view engine', 'ejs');

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

app.listen(port);

console.log(`Listening on port ${port}`);


