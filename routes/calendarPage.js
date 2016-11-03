'use strict';

let authHelper = require('./../authHelper');
let express = require('express');
let moment = require('moment-timezone');
let mongo = require('mongodb').MongoClient;
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

router.get('/calendar/done', function (req, res) {
    res.render('done', {
        title: 'EPSI Ecampus calendar'
    })
});

function tokenReceived (res, error, token) {
    if (error) {
        res.send('error getting token ' + error);
    } else {
        session.access_token = token.token.access_token;
        session.refresh_token = token.token.refresh_token;

        getCourses(req, res);
    }
}

function getCourses (req, res) {
    mongo.connect('mongodb://localhost/ecampus', function (error, db) {
        db.collection('course').find({calendar_id: 1}).toArray(function (err, courses) {
            createJsonBody(req, res, courses);
        });
    });
}

function createJsonBody (req, res, courses) {
    for (let course of courses) {
        let date =  moment(course.date).format('YYYY-MM-DD');

        let subject = course.title;
        let content = course.title + ' avec ' + course.teacher;
        let startDate =  date + 'T' + course.start_at + ':00';
        let endDate =  date + 'T' + course.end_at + ':00';

        let json = {
            "Subject": subject,
            "Body": {
                "ContentType": "HTML",
                "Content": content
            },
            "Start": {
                "DateTime": startDate,
                "TimeZone": "Europe/Paris"
            },
            "End": {
                "DateTime": endDate,
                "TimeZone": "Europe/Paris"
            }
        };

        let json_body = JSON.stringify(json, null, 4);

        createEvents(req, res, json_body);
    }
}

function createEvents (req, res, body) {
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
        body: body
    }, function(error, response, body) {
        console.log(response);
        console.log(body);
    });

    res.redirect('/calendar/done');
}

module.exports = router;
