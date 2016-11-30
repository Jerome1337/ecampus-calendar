'use strict';

let mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const User = mongoose.model('users', {
    username: String,
    password: String,
    city: String,
    promo: String,
    status: String,
    specialite: String
});

const Course = mongoose.model('courses', {
    date: Number,
    title: String,
    teacher: String,
    start_at: String,
    end_at: String,
    _calendar: { type: Schema.Types.ObjectId, ref: 'calendars' }
});

const Calendar = mongoose.model('calendars', {
    city: String,
    promo: String,
    status: String,
    specialite: String
});

module.exports = {
    User,
    Course,
    Calendar
};
