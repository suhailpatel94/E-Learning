'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var course = new Schema({
    name: String,
    material: {
        vids: [

        ],
        docs: [

        ]
    },

    about: String,

    prerequisite: String,

    length: String,

    effort: String,

    Subject: String,

    level: String,

    language: String,

    coverurl:String

}, {
    strict: false
});

module.exports = mongoose.model('course', course);