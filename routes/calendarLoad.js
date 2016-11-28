'use strict';

let _ = require('lodash');
let express = require('express');
let moment = require('moment-timezone'); require('moment-recur');
let mongoose = require('mongoose');
let router = express.Router();
let session = require('express-session');
let {Course} = require('../public/javascripts/model/model');
let { getCalendarDatas, getOrCreateCalendar } = require('../public/javascripts/calendar/calendar');

router.get('/:city/:promo/:status/:spe/calendar/load', (req, res, next) => {
    if (req.cookies.account) {
        let {city, promo, status, spe} = req.params;

        getOrCreateCalendar(city, promo, status, spe)
            .then(function (calendarId) {
                session.calendar_id = calendarId;
                Course.find({'calendar_id': calendarId}, (function (err, courses) {
                    if (courses.length === 0) {
                        _.map(moment([moment().year(), moment().month(), moment().day()]).recur().every(1).weeks().next(40), function (m) {
                            return getCalendarDatas(req.cookies.account, m.format('MM/DD/YYYY'), calendarId);
                        });
                    }
                }));
            })
            .then(function (items) {
                _.each(_.flatten(items), (e) => {
                    e.city = city;
                    e.promo = promo;
                    e.status = status;
                    e.spe = spe;
                });

                res.redirect(`/${city}/${promo}/${status}/${spe}/calendar/${moment().startOf('isoweek').format('DD-MM-YYYY')}/${moment().endOf('isoweek').format('DD-MM-YYYY')}`);
            })
            .catch(function (error) {
                next(error);
            });
    } else {
        res.redirect('/');
    }
});

module.exports = router;
