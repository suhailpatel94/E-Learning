var mongoose = require('mongoose');


var paymentinfo = mongoose.Schema({
    name: String,
    course: String

}, {
    strict: false
})


module.exports = mongoose.model('Paymentinfo', paymentinfo);
