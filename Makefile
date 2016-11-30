install:
	npm i
	sudo sh install-db.sh

test: test_js test_pug test_sass

test_js:
	jshint app.js
	jshint routes/*.js
	jshint public/javascripts/calendar/*.js
	jshint public/javascripts/login/*.js
	jshint public/javascripts/password/*.js

test_pug:
	pug-lint views/*.pug

test_sass:
	sass-lint public/stylesheets/*.sass -v -q
