'use strict';

let _ = require('lodash');
let express = require('express');
let moment = require('moment-timezone'); require('moment-recur');
let mongo = require('mongodb').MongoClient;
let router = express.Router();
let { calendar } = require('../public/javascripts/calendar/calendar');

router.get('/:city/:promo/:status/:spe/calendar/load', (req, res, next) => {
    if (req.cookies.account) {
        let {city, promo, status, spe} = req.params;

        mongo.connect('mongodb://localhost/ecampus', function (error, db) {
            db.collection('calendar').findOne({ city: city, promo: promo, status: status }, function (err, calendar) {
                if (!calendar) {
                    db.collection('calendar').insertOne({
                        city: city,
                        promo: promo,
                        status: status,
                        specialite: spe,
                    });
                }
            });
        });

        //TODO automatisation du calendar_id en fonction du user
        // con.query('DELETE FROM course where calendar_id = \''+ idCalendar + '\'');

        Promise.all(
            _.map(moment([moment().year(), moment().month(), moment().day()]).recur().every(1).weeks().next(40), function (m) {
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
