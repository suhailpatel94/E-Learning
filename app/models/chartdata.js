var mongoose = require('mongoose');

var chartdata = mongoose.Schema({
    label:String,
    data:Number
}, {
    strict: false
})


module.exports = mongoose.model('Chartdata', chartdata);
