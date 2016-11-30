'use strict';

let bodyParser = require('body-parser');
let express = require('express');
let mongoose = require('mongoose');
let path = require('path');
let router = express.Router();
let settings = require(path.join(__dirname, '..', 'settings', 'settings.json'));
let { login } = require('../public/javascripts/login/login');
let { passwordEncrypt } = require('../public/javascripts/password/password');
let { User } = require('../public/javascripts/model/model');

mongoose.connect('mongodb://127.0.0.1:27017/ecampus');

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
            User.find({username: username}, function (err, user) {
                if (!user.length) {
                    let user = new User({
                        username: username,
                        password: encryptedPassword,
                        city: city,
                        promo: promo,
                        status: status,
                        specialite: specialite
                    });
                    user.save(function(err) {
                        if (err) console.log(err);
                    });
                }
            });

            res.cookie('account', eval(account.value), {httpOnly: true}).redirect('/' + city + '/' + promo + '/' + status + '/' + specialite + '/calendar/load');
        })
        .catch(function (error) {
            next(error);
        });
});

module.exports = router;
