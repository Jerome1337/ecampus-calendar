'use strict';
let express = require('express');
let path = require('path');
let router = express.Router();
let settings = require(path.join(__dirname, '..', 'settings', 'settings.json'));

router.get('/', function(req, res) {
  res.render('index', { title: 'EPSI NORD' }, { settings });
});

router.post('/', function(req, res, next) {
  let username = req.body,
      password = req.body,
      promo = req.body;
  let town = promo.split(' '),
      year = promo.split(' ');

  let data = {
    'form.submitted': 1,
    came_from: 'http://ecampusnord.epsi.fr/',
    __ac_name: username,
    __ac_password: password,
  };

  login(data)
      .then(function (account) {
        res
            .cookie('account', eval(account.value), { httpOnly: true })
            .redirect(`/api/${town}/${year}/calendar/load`);
      })
      .catch(function (error) {
        next(error);
      });
});

module.exports = router;
