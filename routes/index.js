'use strict';

let express = require('express');
let mysql = require('mysql');
let path = require('path');
let router = express.Router();
let bodyParser = require('body-parser');
let {login, passwordEncrypt} = require('../public/javascripts/ecampus');
let settings = require(path.join(__dirname, '..', 'settings', 'settings.json'));

router.get('/', bodyParser.json(), function (req, res) {
    res.render('index', {
        title: "EPSI Ecampus calendar",
        data: req.body,
        settings
    });
});

router.post('/', function (req, res, next) {
    let {username, password, city, promo, status, specialite} = req.body;

    let data = {
        'form.submitted': 1,
        came_from: 'http://ecampusnord.epsi.fr/',
        __ac_name: username,
        __ac_password: password,
    };

    let encryptedPassword = passwordEncrypt(password);

    login(data)
        .then(function (account) {
            let con = mysql.createConnection({
                host: settings.db.host,
                user: settings.db.user,
                password: settings.db.password,
                database: settings.db.database
            });

            con.query('SELECT username FROM user WHERE username = \'' + username + '\'', function (err, results) {
                if (results.length === 0) {
                    con.query('INSERT INTO user (username, password, city, promo, status, specialite) VALUES (\'' + username + '\', \'' + encryptedPassword + '\', \'' + city + '\', \'' + promo + '\', \'' + status + '\', \'' + specialite + '\');');
                }
            });

            res
                .cookie('account', eval(account.value), {httpOnly: true})
                .redirect('/' + city + '/' + promo + '/' + status + '/' + specialite + '/calendar/load');
        })
        .catch(function (error) {
            next(error);
        });
});

module.exports = router;
