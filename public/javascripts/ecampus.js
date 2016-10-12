'use strict';

let _           = require('lodash');
let request     = require('request');
let cheerio     = require('cheerio');
let moment      = require('moment-timezone');
let ECAMPUS_URL = 'http://ecampusnord.epsi.fr';

// Get calendar datas method
const calendar = (cookie, date) => {
    return new Promise(function (resolve, reject) {
        let j = request.jar();
        j.setCookie(request.cookie(`__ac=${cookie}`), ECAMPUS_URL);

        request.get({ url: `${ECAMPUS_URL}/emploi_du_temps?date=${date}`, jar: j }, function (err, httpResponse, body) {
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
                'Août': 'August',
                'Septembre': 'September',
                'Octobre': 'October',
                'Novembre': 'November',
                'Décembre': 'December',
            };

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
                    let start = hours[0].split(':');
                    let end = hours[1].split(':');

                    items.push({
                        title: $(this).find('.TCase').text(),
                        teacher: $('<div>' + $(this).find('.TCProf').html().split('<br>')[0] + '</div>').text(),
                        startAt: moment(new Date(day.label)).hour(start[0]).minute(start[1]),
                        endAt: moment(new Date(day.label)).hour(end[0]).minute(end[1]),
                        classroom: $(this).find('.TCSalle').text(),
                    });
                }
            });

            resolve(items);
        });
    });
};

// Login method
const login = (data) => {
    return new Promise(function (resolve, reject) {
        let j = request.jar();

        request.post({ url: `${ECAMPUS_URL}/login_form`, form: data, jar: j }, function (err) {
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
    calendar,
    login,
};
