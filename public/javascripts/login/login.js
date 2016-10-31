'use strict';

let _ = require('lodash');
let request = require('request');
let ECAMPUS_URL = 'http://ecampusnord.epsi.fr';

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

module.exports = {
    login
};
