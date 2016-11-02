'use strict';

let bodyParser = require('body-parser');
let express = require('express');
let mongo = require('mongodb').MongoClient;
let path = require('path');
let router = express.Router();
let settings = require(path.join(__dirname, '..', 'settings', 'settings.json'));
let { login } = require('../public/javascripts/login/login');
let { passwordEncrypt } = require('../public/javascripts/password/password');

router.get('/', bodyParser.json(), function (req, res) {
    res.render('index', {
        title: 'EPSI Ecampus calendar',
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
            mongo.connect('mongodb://localhost/ecampus', function (error, db) {
                db.collection('user').findOne({ username: username }, function (err, user) {
                    if (!user) {
                        db.collection('user').insertOne({
                            username: username,
                            password: encryptedPassword,
                            city: city,
                            promo: promo,
                            status: status,
                            specialite: specialite
                        });
                    }
                    });
            });
           res.cookie('account', eval(account.value), {httpOnly: true}).redirect('/' + city + '/' + promo + '/' + status + '/' + specialite + '/calendar/load');
        })
        .catch(function (error) {
            next(error);
        });
});

module.exports = router;
