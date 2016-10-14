'use strict';

let express = require('express');
let mysql = require("mysql");
let path = require('path');
let router = express.Router();
let bodyParser = require('body-parser');
let { login, passwordEncrypt } = require('../public/javascripts/ecampus');
let settings = require(path.join(__dirname, '..', 'settings', 'settings.json'));

router.get('/', bodyParser.json(), function(req, res) {
  res.render('index', {
      title: "EPSI Ecampus calendar",
      data: req.body,
      settings
  });
});

router.post('/', function(req, res, next) {
  let { username, password, promo, status, specialite } = req.body;
  let [town, year] = promo.split(' ');

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
              host: 'localhost',
              user: 'root',
              password: 'root',
              database: 'ecampus'
          });

          con.query('SELECT username FROM user WHERE username = \'' + username + '\'', function (err, results) {
              if (results.length == 0) {
                  con.query('INSERT INTO user (username, password, town, promo, status, specialite) VALUES (\'' + username + '\', \'' + encryptedPassword + '\', \'' + town +  '\', \'' + year + '\', \'' + status + '\', \'' + specialite + '\');');
              }
          });

          res
              .cookie('account', eval(account.value), { httpOnly: true })
              .redirect('/' + town + '/' + year + '/calendar/load');
      })
      .catch(function (error) {
        next(error);
      });
});

module.exports = router;
