var express = require('express');
var router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

const search = require('./search')
const data = require('./data')

router.get('/search', search);

router.get('/data/:imdbID', data)

module.exports = router;