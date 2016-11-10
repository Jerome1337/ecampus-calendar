'use strict';

let moment = require('moment-timezone');
let request = require('request');
let session = require('express-session');

const createJsonBody = (courses) => {
    for (let course of courses) {
        let date =  moment(course.date).tz('Europe/Paris').format('YYYY-MM-DD');
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

        createEvents(json_body);
    }
};

function createEvents (json_body) {
    let parsedJson = JSON.parse(json_body);
    let url = 'https://outlook.office.com/api/v2.0/me/calendarview?startDateTime=' + parsedJson.Start.DateTime + '&endDateTime=' + parsedJson.End.DateTime + '&$select=Subject';

    request({
        url: url,
        method: 'GET',
        headers: {
            'Content-type': 'application/json',
            'Authorization': 'Bearer ' + session.access_token,
        }
    }, function (error, response, body) {
        let parsedBody = JSON.parse(body);

        if (parsedBody.length !== 0) {
            let url = 'https://outlook.office.com/api/v2.0/me/events';

            request({
                url: url,
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': 'Bearer ' + session.access_token,
                },
                body: json_body
            });
        } else {
            console.log('Evenements déjà créé');
        }
    });
}

module.exports = {
    createJsonBody
};
