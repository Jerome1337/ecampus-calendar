'use strict';

let _ = require('lodash');
let request = require('request');
let mysql = require('mysql');
let cheerio = require('cheerio');
let moment = require('moment-timezone');
let path = require('path');
let settings = require(path.join(__dirname, '../..', 'settings', 'settings.json'));
let ECAMPUS_URL = 'http://ecampusnord.epsi.fr';

let crypto = require('crypto');
let algorithm = 'aes-256-ctr';
let key = 'djcu43R(';

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

// Encrypt user password
const passwordEncrypt = (value) => {
    let cipher = crypto.createCipher(algorithm, key);
    let crypted = cipher.update(value, 'utf8', 'hex');

    crypted += cipher.final('hex');

    return crypted;
};

// Decrypt user password
const passwordDecrypt = (value) => {
    let decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(value, 'hex', 'utf8');

    decrypted += decipher.final('utf8');

    return decrypted;
};

// Get calendar datas method
const calendar = (cookie, date) => {
    return new Promise(function (resolve, reject) {
        let j = request.jar();
        j.setCookie(request.cookie(`__ac=${cookie}`), ECAMPUS_URL);

        request.get({url: `${ECAMPUS_URL}/emploi_du_temps?date=${date}`, jar: j}, function (err, httpResponse, body) {
            if (err) {
                return reject(err);
            }

            let $ = cheerio.load(body);
            let givenYear = moment(date, 'MM/DD/YYYY').format('YYYY');
            let items = [];
            let days = [];
            let months = {
                'Janvier': 'January',
                'Février': 'February',
                'Mars': 'March',
                'Avril': 'April',
                'Mai': 'May',
                'Juin': 'June',
                'Juillet': 'July',
                'Aout': 'August',
                'Septembre': 'September',
                'Octobre': 'October',
                'Novembre': 'November',
                'Décembre': 'December',
            };

            let con = mysql.createConnection({
                host: settings.db.host,
                user: settings.db.user,
                password: settings.db.password,
                database: settings.db.database
            });

            $('.Jour').each(function () {
                let humanDate = $(this).text().split(' ');

                days.push({
                    label: `${humanDate[1]} ${months[humanDate[2]]} ${givenYear}`,
                    left: parseInt($(this).css('left').split('.')[0]),
                });
            });

            $('table.TCase').each(function () {
                if ($(this).find('.TCase').text()) {
                    let itemLeft = $(this).parent().parent().parent().css('left').split('.')[0];

                    let day = _.find(days, (d) => d.left == itemLeft);
                    let hours = $(this).find('.TChdeb').text().split(' - ');

                    items.push({
                        title: $(this).find('.TCase').text(),
                        teacher: $('<div>' + $(this).find('.TCProf').html().split('<br>')[0] + '</div>').text(),
                        date: moment(new Date(day.label)).tz('Europe/Paris').format('YYYY/MM/DD'),
                        startAt: hours[0],
                        endAt: hours[1],
                    });
                }
            });

            for (let item of items) {
                con.query('INSERT INTO course (calendar_id, date, title, teacher, start_at, end_at) VALUES (6, \'' + item.date + '\', "' + item.title + '", "' + item.teacher + '", \'' + item.startAt + '\', \'' + item.endAt + '\');');
            }

            resolve(items);
        });
    });
};

module.exports = {
    login,
    passwordEncrypt,
    passwordDecrypt,
    calendar
};
