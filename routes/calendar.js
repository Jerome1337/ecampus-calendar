'use strict';

let _ = require('lodash');
let express = require('express');
let mysql = require('mysql');
let router = express.Router();
let moment = require('moment-timezone');
require('moment-recur');
let {calendar} = require('../public/javascripts/ecampus');
let path = require('path');
let settings = require(path.join(__dirname, '..', 'settings', 'settings.json'));

router.get('/:city/:promo/:status/:spe/calendar/load', (req, res, next) => {
    if (req.cookies.account) {
        let {city, promo, status, spe} = req.params;

        let con = mysql.createConnection({
            host: settings.db.host,
            user: settings.db.user,
            password: settings.db.password,
            database: settings.db.database
        });

        con.query('SELECT city, promo, status, specialite FROM calendar WHERE (city = \'' + city + '\' AND promo = \'' + promo + '\' AND status = ' + status + ' AND specialite = \'' + spe + '\')', function (err, results) {
            if (results.length === 0) {
                con.query('INSERT INTO calendar (city, promo, status, specialite) VALUES (\'' + city + '\', \'' + promo + '\', \'' + status + '\', \'' + spe + '\');');
            }
        });

        Promise.all(
            _.map(moment([2016, 8, 1]).recur().every(1).weeks().next(40), function (m) {
                return calendar(req.cookies.account, m.format('MM/DD/YYYY'));
            })
        )
            .then(function (items) {
                _.each(_.flatten(items), (e) => {
                    e.city = city;
                    e.promo = promo;
                    e.status = status;
                    e.spe = spe;
                });

                res.redirect(`/${city}/${promo}/${status}/${spe}/calendar/${moment().format('DD-MM-YYYY')}`);
            })
            .catch(function (error) {
                next(error);
            });
    } else {
        res.redirect('/');
    }
});

module.exports = router;
