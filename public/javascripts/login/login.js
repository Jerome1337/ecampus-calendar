'use strict';

let _ = require('lodash');
let ECAMPUS_URL = 'http://ecampusnord.epsi.fr';
let request = require('request');
let session = require('express-session');
let { getCourses } = require('../calendar/calendar');

// Login method
const login = (data) => {
    return new Promise(function (resolve, reject) {
        let j = request.jar();

        request.post({url: `${ECAMPUS_URL}/login_form`, form: data, jar: j}, function (err) {
            if (err) {
                return reject(err);
            }

            let cookies = j.getCookies(ECAMPUS_URL);
            let account = _.find(cookies, (c) => c.key == '__ac');

            if (account) {
                resolve(account);
            } else {
                let err = new Error('Login failed');
                reject(err);
            }
        });
    });
};

const tokenReceived = (res, error, token) => {
    if (error) {
        res.send('error getting token ' + error);
    } else {
        session.access_token = token.token.access_token;
        session.refresh_token = token.token.refresh_token;

        getCourses();
    }
};

module.exports = {
    login,
    tokenReceived
};
