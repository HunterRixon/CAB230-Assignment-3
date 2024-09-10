var express = require('express');
var router = express.Router();
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET

const login = require('./login');
const register = require('./register')
const refresh = require('./refresh')
const logout = require('./logout')
const getprofile = require('./GETprofile');
const putprofile = require('./PUTprofile')
const authenticateUser = require('./authenticateUser');

router.post('/login', login);

router.post('/register', register);

router.post('/refresh', refresh);

router.post('/logout', logout);

router.get('/:email/profile', authenticateUser, getprofile);

router.put('/:email/profile', authenticateUser, putprofile);

module.exports = router;


