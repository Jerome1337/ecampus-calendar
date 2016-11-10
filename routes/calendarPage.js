'use strict';

let authHelper = require('./../authHelper');
let express = require('express');
let router = express.Router();
let { tokenReceived } = require('../public/javascripts/login/login');

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
        res.redirect('/calendar/done');
    } else {
        res.redirect('/');
    }
});

router.get('/calendar/done', function (req, res) {
    res.render('done', {
        title: 'EPSI Ecampus calendar'
    });
});

module.exports = router;
