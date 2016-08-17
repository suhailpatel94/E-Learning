var mongoose = require('mongoose');

var enroll = mongoose.Schema({
    username:String,
    course:[String]
}, {
    strict: false
})


module.exports = mongoose.model('Enroll', enroll);
