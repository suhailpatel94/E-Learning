var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var employee = mongoose.Schema({
    Name: String,
    email: String,
    password: String,
    Skills: [String],
    contact: Number,
    ResumeFilename:String,
    ResumeFileOriginalname:String,
    Certificate:[String]
}, {
    strict: false
})

employee.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

employee.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('Employee', employee);
