var mongoose = require('mongoose');

var paper = mongoose.Schema({
    course_id: String,
    paperNo: Number
});


module.exports = mongoose.model("Paper", paper);
