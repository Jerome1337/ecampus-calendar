'use strict';

let _ = require('lodash');
let cheerio = require('cheerio');
let ECAMPUS_URL = 'http://ecampusnord.epsi.fr';
let moment = require('moment-timezone');
let mongoose = require('mongoose');
let request = require('request');
let session = require('express-session');
let { createJsonBody } = require('../event/event');
let { Calendar, Course } = require('../model/model');

// Create or get existing calendar id
const getOrCreateCalendar = (city, promo, status, spe) => {
    return new Promise(function (resolve, reject) {
        Calendar.findOne({city: city, promo: promo, status: status}, function (err, result) {
            if (!result) {
                let calendar = new Calendar({
                    city: city,
                    promo: promo,
                    status: status,
                    specialite: spe
                });
                calendar.save(function (err, result) {
                    let calendarId = result.insertedId;
                    return resolve(calendarId);
                });
            } else {
                let calendarId = result._id;
                return resolve(calendarId);
            }
        });
    });
};

// Get calendar datas method
const getCalendarDatas = (cookie, date, calendarId) => {
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
                        date: moment(new Date(day.label)).valueOf(),
                        startAt: hours[0],
                        endAt: hours[1],
                    });
                }
            });

            for (let item of items) {
                let course = new Course({
                    calendar_id: calendarId,
                    date: item.date,
                    title: item.title,
                    teacher: item.teacher,
                    start_at: item.startAt,
                    end_at: item.endAt
                });
                saveCourse(course);
            }

            resolve(items);
        });
    });
};

const saveCourse = function(course) {
    course.save(function (err) {
        if (err) console.log(err);
    });
};

const getCourses = () => {
    Course.find({'calendar_id': session.calendar_id}).sort({date: 1}).exec(function (err, courses) {
        createJsonBody(courses);
    });
};

module.exports = {
    getOrCreateCalendar,
    getCalendarDatas,
    getCourses
};
