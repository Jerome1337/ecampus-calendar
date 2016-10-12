'use strict';

let express = require('express');
let path = require('path');
let router = express.Router();
let { login } = require('../public/javascripts/ecampus');
let settings = require(path.join(__dirname, '..', 'settings', 'settings.json'));

router.get('/', function(req, res) {
  res.render('index', { settings });
});

router.post('/', function(req, res, next) {
  let { username, password, promo } = req.body;
  let [town, year] = promo.split(' ');

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
            .redirect('/' + town + '/' + year + '/calendar/load');
      })
      .catch(function (error) {
        next(error);
      });
});

module.exports = router;
