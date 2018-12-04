const SQL = require("sql-template-strings");

const express = require('express');
const bcrypt = require('bcrypt');
const Promise = require('bluebird');
const sqlite = require('sqlite');
const config = require('./config');
const session = require('express-session');
const bodyParser = require('body-parser');
const index = require('/.index2.js');


//Get the posts that are made by a certain person with a Username
