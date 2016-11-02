'use strict';

let _ = require('lodash');
let cheerio = require('cheerio');
let ECAMPUS_URL = 'http://ecampusnord.epsi.fr';
let moment = require('moment-timezone');
let mongo = require('mongodb').MongoClient;
let request = require('request');

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

            mongo.connect('mongodb://localhost/ecampus', function (error, db) {
                for (let item of items) {
                    db.collection('course').insertOne({calendar_id: 1, date: item.date, title: item.title, teacher: item.teacher, start_at: item.startAt, end_at: item.endAt});
                }
            });

            resolve(items);
        });
    });
};

module.exports = {
    calendar
};
