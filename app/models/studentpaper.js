var mongoose = require('mongoose');


var studentpaper = mongoose.Schema({
    student_name: String,

    paper_id: String,

    answers: [

    ],
    status: String

}, {
    strict: false
})

module.exports = mongoose.model("Studentpaper", studentpaper);
