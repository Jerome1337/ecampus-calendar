'use strict';

let express = require('express');
let mysql = require('mysql');
let path = require('path');
let router = express.Router();
let session = require('express-session');
let settings = require(path.join(__dirname, '..', 'settings', 'settings.json'));
let authHelper = require('./../authHelper');

router.get('/:city/:promo/:status/:spe/calendar/:startDate/:endDate', function (req, res) {
    let {city, promo, status, spe, startDate, endDate} = req.params;

    let con = mysql.createConnection({
        host: settings.db.host,
        user: settings.db.user,
        password: settings.db.password,
        database: settings.db.database
    });

    let calendar_id = '';

    let authUrl = authHelper.getAuthUrl();

    con.query('SELECT id FROM calendar WHERE (city = \'' + city + '\' AND promo = \'' + promo + '\' AND status = ' + status + ' AND specialite = \'' + spe + '\')', function (err, result) {
        con.query('SELECT * FROM course WHERE (calendar_id = ' + result[0].id + ' AND date BETWEEN \'' + startDate + '\' AND \'' + endDate + '\') ORDER BY date', function (err, results) {
            res.render('calendar', {
                title: 'EPSI Ecampus calendar',
                courses: results,
                authUrl: authUrl
            });
        });
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
