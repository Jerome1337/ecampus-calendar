'use strict';

let _             = require('lodash');
let express       = require('express');
let router        = express.Router();
let moment        = require('moment-timezone'); require('moment-recur');
let { calendar }  = require('../public/javascripts/ecampus');

router.get('/:town/:year/calendar/load', (req, res, next) => {
  if (req.cookies.account) {
    let { year, town } = req.params;
    year = year.toLowerCase();
    town = town.toLowerCase();

    Promise.all(
        _.map(moment([2015, 8, 1]).recur().every(1).weeks().next(40), function (m) {
          return calendar(req.cookies.account, m.format('MM/DD/YYYY'));
        })
    )
        .then(function (items) {
          _.each(_.flatten(items), (e) => {
            e.year = year;
            e.town = town;
          });

          res.redirect(`/${town}/${year}/calendar/${moment().format('DD-MM-YYYY')}`);
        })
        .catch(function (error) {
          next(error);
        });
  } else {
    res.redirect('/');
  }
});

module.exports = router;
