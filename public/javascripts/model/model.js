/**
 * Created by JBouquet on 10/11/2016.
 */
let mongoose = require('mongoose'),
    Schema = mongoose.Schema;


const User = mongoose.model('user', {
    username: String,
    password: String,
    city: String,
    promo: String,
    status: String,
    specialite: String
});

const Course = mongoose.model('course', {
    calendar_id: Schema.ObjectId,
    date: Number,
    title: String,
    teacher: String,
    start_at: String,
    end_at: String
});


const Calendar = mongoose.model('calendar', {
    id: Schema.ObjectId,
    city: String,
    promo: String,
    status: String,
    specialite: String
});


module.exports = {
    User,
    Course,
    Calendar
}
