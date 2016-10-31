'use strict';

let authHelper = require('./../authHelper');
let express = require('express');
let router = express.Router();
let session = require('express-session');

router.get('/:city/:promo/:status/:spe/calendar/:startDate/:endDate', function (req, res) {
    let authUrl = authHelper.getAuthUrl();

    res.render('calendar', {
        title: 'EPSI Ecampus calendar',
        authUrl: authUrl
    });
});

router.get('/authorize', function (req, res) {
    let authCode = req.query.code;

    if (authCode) {
        authHelper.getTokenFromCode(authCode, tokenReceived, res);
    } else {
        res.redirect('/');
    }
});

function tokenReceived (res, error, token) {
    if (error) {
        res.send('error getting token ' + error);
    } else {
        session.access_token = token.token.access_token;
        session.refresh_token = token.token.refresh_token;
        res.redirect('/');
    }
}

module.exports = router;
