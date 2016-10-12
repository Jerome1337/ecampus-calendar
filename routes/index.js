let express = require('express');
let path = require('path');
let router = express.Router();
let settings = require(path.join(__dirname, '..', 'settings', 'settings.json'));

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { settings });
});

module.exports = router;
