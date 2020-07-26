const express = require('express');
const {getUsers} = require('./../controllers/users');

const advancesResults = require('./../middleware/advancedResults');
const User = require('./../models/User');

const router = express.Router();

router.route('/')
    .get(advancesResults(User), getUsers);

module.exports = router;