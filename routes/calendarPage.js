'use strict';

let authHelper = require('./../authHelper');
let express = require('express');
let moment = require('moment-timezone');
let router = express.Router();
let session = require('express-session');

router.get('/:city/:promo/:status/:spe/calendar/:startDate/:endDate', function (req, res) {
    let authUrl = authHelper.getAuthUrl();

    insertDatasJson(results);

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

        createEvents(res);
    }
}

function insertDatasJson (results) {
    let fs = require('fs');
    let base = require('../public/json/outlook.json');
    let outputfile = './public/json/output/outlookOutput.json';
    let output = {};

    fs.writeFile(outputfile, '');

    for (let result of results) {
        let date =  moment(result.date).format('YYYY-MM-DD');

        base.Subject = result.title;
        base.Body.Content = result.title + ' avec ' + result.teacher;
        base.Start.DateTime =  date + 'T' + result.start_at + ':00';
        base.End.DateTime =  date + 'T' + result.end_at + ':00';
    }

    fs.writeFileSync(outputfile, JSON.stringify(base, null, 4));
}

function createEvents (res) {
    let request = require('request');
    let events = require('../public/json/output/outlookOutput.json');
    let url = 'https://outlook.office.com/api/v2.0/me/events';

    request({
        url: url,
        method: 'POST',
        json: true,
        headers: {
            'Content-type': 'application/json',
            'Authorization': 'Bearer ' + session.access_token,
        },
        body: events
    }, function(error, response, body) {
        console.log(response);
        console.log(body);
    });

    res.redirect('/calendar/done');
}

module.exports = router;
