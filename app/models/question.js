var mongoose = require('mongoose');

var question = mongoose.Schema({
    paper_id: String,

    question: String,
    options: {
        "a": String,
        "b": String,
        "c": String,
        "d": String
    },
    answer: String


}, {
    strict: false
})


module.exports = mongoose.model('Question', question);
