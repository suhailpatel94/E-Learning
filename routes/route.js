'use strict';
var crypto = require('crypto');
var path = process.cwd();
var pth = require('path');
var mkdirp = require('mkdirp');
var CourseHandler = require(path + '/app/controllers/courseController.server.js');

var course = require('../app/models/course.js');
var multer = require('multer');

var storage = multer.diskStorage({
    destination: './public/resume',
    filename: function(req, file, cb) {
        crypto.pseudoRandomBytes(16, function(err, raw) {
            if (err) return cb(err)

            cb(null, raw.toString('hex') + pth.extname(file.originalname))
        })
    }
});

var vidName, vidurl, cname, vidinfo = {},
    wk;
var courseStorage = multer.diskStorage({

    destination: function(req, file, cb) {

        course.findById(req.params.id, function(err, course_name) {

            var week = "week " + req.body.week;
            wk = week;
            var url = "./public/courses/" + course_name['name'] + "/" + week + "/vids";
            vidurl = "courses/" + course_name['name'] + "/" + week + "/vids/";
            cname = course_name['name'];
            mkdirp(url, function(err) {

                console.log("cant create directory")
                cb(null, url)
            });


        })

    },
    filename: function(req, file, cb) {
        crypto.pseudoRandomBytes(16, function(err, raw) {
            if (err) return cb(err)
            console.log(file)
            vidName = file.originalname;
            vidurl = vidurl + vidName;
            cb(null, file.originalname)

        })
    }



});

var docStorage = multer.diskStorage({

    destination: function(req, file, cb) {

        course.findById(req.params.id, function(err, course_name) {

            var week = "week " + req.body.week;
            wk = week;
            var url = "./public/courses/" + course_name['name'] + "/" + week + "/docs";
            vidurl = "courses/" + course_name['name'] + "/" + week + "/docs/";
            cname = course_name['name'];
            mkdirp(url, function(err) {

                console.log("cant create directory")
                cb(null, url)
            });


        })

    },
    filename: function(req, file, cb) {
        crypto.pseudoRandomBytes(16, function(err, raw) {
            if (err) return cb(err)
            console.log(file)
            vidName = file.originalname;
            vidurl = vidurl + vidName;
            cb(null, file.originalname)

        })
    }



});

var coverStorage = multer.diskStorage({

    destination: function(req, file, cb) {

        course.findById(req.params.id, function(err, course_name) {
            console.log("covercover")
            var url = "./public/courses/" + course_name['name'] + "/cover";
            vidurl = "/courses/" + course_name['name'] + "/cover/";
            cname = course_name['name'];
            mkdirp(url, function(err) {

                console.log("cant create directory")
                cb(null, url)
            });


        })

    },
    filename: function(req, file, cb) {
        crypto.pseudoRandomBytes(16, function(err, raw) {
            if (err) return cb(err)
            console.log(file)
            vidName = file.originalname;
            vidurl = vidurl + vidName;
            cb(null, file.originalname)

        })
    }



});


var upload = multer({
    storage: storage
});


var uploadvid = multer({
    storage: courseStorage
});

var uploaddoc = multer({
    storage: docStorage
});

var uploadcover = multer({
    storage: coverStorage
});



function saveVidDb(req, res, next) {
    vidinfo.name = vidName;
    vidinfo.url = vidurl;
    vidinfo.week = wk;
    console.log(vidinfo)
    course.update({
            "name": cname
        }, {
            $push: {
                "material.vids": {
                    $each: [vidinfo],
                    $sort: {
                        "week": 1
                    }
                }



            }
        })
        .exec(function(err, result) {
            console.log(result);
            return next()
        })
};

function saveDocDb(req, res, next) {
    vidinfo.name = vidName;
    vidinfo.url = vidurl;
    vidinfo.week = wk;
    console.log(vidinfo)
    course.update({
            "name": cname
        }, {
            $push: {
                "material.docs": {
                    $each: [vidinfo],
                    $sort: {
                        "week": 1
                    }
                }



            }
        })
        .exec(function(err, result) {
            console.log(result);
            return next()
        })
};


function saveCoverDb(req, res, next) {
    vidinfo.name = vidName;
    vidinfo.url = vidurl;
    vidinfo.week = wk;
    console.log("save cover to db" + vidinfo)
    course.update({
            "name": cname
        }, {
            "coverurl": vidurl
        })
        .exec(function(err, result) {
            console.log(result);
            return next()
        })
};

module.exports = function(app, passport) {

    var coursehandler = new CourseHandler();

    app.get('/', coursehandler.popularCourse);

    app.get('/login', function(req, res) {
        res.render('login', {
            session: req.user
        })


    });

    app.get('/a/execute', isLoggedIn, coursehandler.executePaypal);

    app.get('/signup', function(req, res) {
        res.render('signup', {
            session: req.user
        });
    });

    app.post('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    app.post('/login', passport.authenticate('local-signin', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
        })

    );


    app.get('/admin', coursehandler.getCourse);

    app.post('/admin', coursehandler.addCourse);
    
    app.post('/enroll',coursehandler.enroll);
    
    app.post('/deletegraphdata',coursehandler.deletegraph)
    
    app.get('/admin/showgraph', coursehandler.showgraph)
    
    app.post('/admin/showgraph', coursehandler.addgraphdata)

    app.get('/admin/cover/:id', coursehandler.addCover)

    app.post('/admin/cover/:id', uploadcover.single('cover'), saveCoverDb, coursehandler.saveCover);

    app.get('/admin/vids/:id', coursehandler.addVideo);

    app.post('/admin/vids/:id', uploadvid.single('video'), saveVidDb, coursehandler.saveVideo);

    app.post('/admin/docs/:id', uploaddoc.single('video'), saveDocDb, coursehandler.saveVideo);

    app.post('/deletevideo', coursehandler.delVideo);

    app.post('/deletedocument', coursehandler.delDocument);

    app.get('/admin/docs/:id', coursehandler.addDocs);

    app.get('/admin/:id/paper', coursehandler.courseMod);

    app.post('/admin/:id/paper', coursehandler.createPaper);

    app.get('/admin/:id/:pid', coursehandler.newQuestion);

    app.post('/admin/:id/:pid', coursehandler.addQuestion);

    app.get('/employeeRegistration', coursehandler.employeeRegister);

    app.post('/employeeRegistration', upload.single('Resume'), coursehandler.postemployeeRegister);

    app.get('/:id', isLoggedIn, coursehandler.courseInfo);

    app.post('/:id/create', isLoggedIn, coursehandler.pay);




    // =====================================
    // GOOGLE ROUTES =======================
    // =====================================

    app.get('/auth/google', passport.authenticate('google', {
        scope: ['profile', 'email']
    }));

    app.get('/auth/google/callback', passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

    app.get('/:cid/:pid', coursehandler.showPaper);
    app.post('/:cid/:pid', coursehandler.processPaper);


};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/')

}