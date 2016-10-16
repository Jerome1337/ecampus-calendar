'use strict';

let express = require('express');
let mysql = require('mysql');
let path = require('path');
let router = express.Router();
let settings = require(path.join(__dirname, '..', 'settings', 'settings.json'));

router.get('/:city/:promo/:status/:spe/calendar/:startDate/:endDate', function (req, res) {
    let {city, promo, status, spe, startDate, endDate} = req.params;

    let con = mysql.createConnection({
        host: settings.db.host,
        user: settings.db.user,
        password: settings.db.password,
        database: settings.db.database
    });

    var calendar_id = '';

    con.query('SELECT id FROM calendar WHERE (city = \'' + city + '\' AND promo = \'' + promo + '\' AND status = ' + status + ' AND specialite = \'' + spe + '\')', function (err, result) {
        con.query('SELECT * FROM course WHERE (calendar_id = ' + result[0].id + ' AND date BETWEEN \'' + startDate + '\' AND \'' + endDate + '\') ORDER BY date', function (err, results) {
            res.render('calendar', {
                title: 'EPSI Ecampus calendar',
                courses: results
            });
        });
    });
});

module.exports = router;
