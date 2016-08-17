'use strict';

var Users = require('../models/users.js');
var course = require('../models/course.js');
var Paper = require('../models/paper.js');
var Question = require('../models/question.js');
var Studentpaper = require('../models/studentpaper.js');
var path = process.cwd();
var paypalconfig = require('../config/ppconfig');
var Employees = require('../models/employee');
var Paymentinfos = require('../models/paymentinfo');
var Chartdatas = require('../models/chartdata');
var Enrolls = require('../models/enroll');

var paypal = require('paypal-rest-sdk');

var ch = new ClickHandler();
ch.initPaypal();

function ClickHandler() {
    this.popularCourse = function (req, res) {
        course.find({}, {
                "name": 1
                , "coverurl": 1
            })
            .exec(function (err, result) {

                if (err) throw err;

                Chartdatas.find({})
                    .exec(function (err, chart_data) {
                        var label = []
                            , data = [];

                        for (var i = 0; i < chart_data.length; i++) {
                            label.push(chart_data[i]['label']);
                            data.push(chart_data[i]['data'])
                        }

                        res.render('index', {
                            result: result
                            , session: req.user
                            , label
                            , data
                        });
                    });


            });
    };

    this.courseInfo = function (req, res) {

        var cid = req.params.id;
        course.findById(cid, function (err, result) {
            console.log("This is is is cid " + result)
            if (err) throw err;

            Paper.find({
                    "course_id": cid
                })
                .exec(function (err, test) {
                    if (err) throw err;

                    Studentpaper.find({
                            "student_name": req.user.name
                        }, {
                            "paper_id": 1
                            , "status": 1
                        })
                        .exec(function (err, status) {
                        if(status[0]==null)
                           status="no";
                            Paymentinfos.find({
                                    "name": req.user.name
                                    , "course": result['name']
                                })
                                .exec(function (err, payment) {
                                    if (payment[0] ==null)
                                        payment = "no"

                                    Employees.find({})
                                        .exec(function (err, emp_info) {

                                            if (emp_info[0] == null)
                                                emp_info = "no"
                                            var enroll_info;

                                            Enrolls.findOne({
                                                    "username": req.user.name
                                                    , "course": {
                                                        $in: [cid]
                                                    }
                                                })
                                                .exec(function (err, enroll) {
                                                    if (enroll == null)
                                                        enroll_info = "no"
                                                    else
                                                        enroll_info = enroll;

                                                    res.render('courseInfo', {
                                                        result, test, status, session: req.user, payment, emp_info, enroll_info
                                                    });
                                                })


                                        });
                                })

                        })

                });


        });


    };


    this.getCourse = function (req, res) {

        course.find({}, {
                "name": 1
            })
            .exec(function (err, result) {
                res.render("admin", {
                    result
                });
            });

    };

    this.createPaper = function (req, res) {
        var courseId = req.params.id;
        var no = req.body.no;
        var paper = new Paper();
        paper.course_id = courseId;
        paper.paperNo = no;
        paper.save(function (err) {
            if (err) throw err;
            res.redirect("back");
        });

    };


    this.courseMod = function (req, res) {
        var courseId = req.params.id;
        Paper.find({
                "course_id": courseId
            })
            .exec(function (err, result) {
                if (err) throw err;
                res.render("paper", {
                    result
                });
            });


    };


    this.newQuestion = function (req, res) {
        res.render("question");

    }

    this.addQuestion = function (req, res) {
        var paperId = req.params.pid;

        var ques = new Question();
        ques.paper_id = paperId;
        ques.question = req.body.question;
        ques.options.a = req.body.opt1;
        ques.options.b = req.body.opt2;
        ques.options.c = req.body.opt3;
        ques.options.d = req.body.opt4;
        ques.answer = req.body.answer;
        ques.save(function (err) {
            if (err) throw err;
            res.redirect("back");
        });

    }

    this.showPaper = function (req, res) {
        var paperId = req.params.pid;

        Question.find({
            "paper_id": paperId
        })

        .exec(function (err, result) {
            if (err) throw err;

            res.render("testpaper", {
                result, session: req.user
            });
        });
    }




    this.processPaper = function (req, res) {

        var pid = req.params.pid;
        var ans = req.body;
        var ansLen = Object.keys(ans).length;
        var q = [];
        var qp, marks = 0;
        console.log("asdasdasdasd")
        for (var i = 0; i < ansLen; i++) {
            var o = {};
            o['question_id'] = Object.keys(ans)[i];
            o['answer'] = ans[Object.keys(ans)[i]];
            q.push(o);
        }

        Question.find({
                "paper_id": pid
            }, {
                "answer": 1
            })
            .exec(function (err, result) {
                console.log(result);
                console.log(ans);
                qp = result;
                verifyAnswers();
                checkexist();
                res.redirect("back")
            });

        function verifyAnswers() {
            for (var ab = 0; ab < Object.keys(ans).length; ab++) {
                if (ans[qp[ab]._id] == qp[ab].answer)
                    marks++;

            }
        }

        function checkexist() {

            Studentpaper.count({
                "student_name": req.user.name
                , "paper_id": pid
            }).exec(function (err, result) {
                console.log("this is aaaa  " + result);
                if (parseInt(result) == 0)
                    saveDb();
                else {
                    var stats;
                    if (marks < ansLen / 2)
                        stats = "remove"
                    else
                        stats = "ok"
                    Studentpaper.update({
                            "student_name": req.user.name
                            , "paper_id": pid
                        }, {
                            "status": stats
                        })
                        .exec(function (err, result) {

                        })
                }
            });


        }

        function saveDb() {
            var sp = new Studentpaper();
            sp.student_name = req.user.name;
            sp.paper_id = pid;
            sp.answers = q;
            if (marks < ansLen / 2)
                sp.status = "remove";
            else
                sp.status = "ok";

            sp.save();
            console.log(marks);
        }


    };

    this.initPaypal = function () {
        paypal.configure(paypalconfig.api);
        console.log("adasdjaslkjdklasjdklasjdlkasjldkjasldjaslkdjaskldjaklsjdkalsjdladasdjaslkjdklasjdklasjdlkasjldkjasldjaslkdjaskldjaklsjdkalsjdl");
    };

    this.pay = function (req, res) {

        console.log("paypaypaypaypaypaypay");
        var course_name = req.body.course
        var payment = {
            "intent": "sale"
            , "payer": {
                "payment_method": "paypal"
            }
            , "redirect_urls": {
                "return_url": "http://localhost:3000/a/execute"
                , "cancel_url": "http://localhost:3000/cancel"
            }
            , "transactions": [{
                "amount": {
                    "total": "10.00"
                    , "currency": "USD"
                }
                , "description": "My awesome payment"
                , "item_list": {
                    "items": [{
                        "quantity": "1"
                        , "name": course_name
                        , "price": "10.00"
                        , "sku": "product12345"
                        , "currency": "USD"
                    }]
                }
            }]
        };



        paypal.payment.create(payment, function (error, payment) {
            if (error) {
                console.log(error);
            } else {
                console.log(payment);
                if (payment.payer.payment_method === 'paypal') {
                    req.session.paymentId = payment.id;
                    var redirectUrl;
                    for (var i = 0; i < payment.links.length; i++) {
                        var link = payment.links[i];
                        if (link.method === 'REDIRECT') {
                            redirectUrl = link.href;
                        }
                    }
                    res.redirect(redirectUrl);
                }
            }
        });
    };

    this.executePaypal = function (req, res) {
        var paymentId = req.session.paymentId;
        var payerId = req.query.PayerID;
        console.log(req.url);
        console.log(payerId);
        var details = {
            "payer_id": payerId
        };
        paypal.payment.execute(paymentId, details, function (error, payment) {
            if (error) {
                console.log(error);
            } else {
                var course_nme = payment.transactions[0].item_list.items[0].name;
                var pamnt = new Paymentinfos();
                pamnt.name = req.user.name;
                pamnt.course = course_nme;
                pamnt.save(function (err) {
                    res.redirect('/')
                })

            }
        });
    };



    this.employeeRegister = function (req, res) {
        res.render('jobEmployeeRegister', {
            session: req.user
        });
    };


    this.postemployeeRegister = function (req, res) {


        Paymentinfos.find({
                name: req.user.name
            })
            .exec(function (err, certificate) {
                var cert = [];
                for (var i = 0; i < certificate.length; i++) {
                    cert.push(certificate[0]['course'])
                }
                var employee = new Employees();
                console.log(req.file)
                console.log(req.body)
                employee.Name = req.user.name
                employee.email = req.body.email
                employee.password = employee.generateHash(req.body.password);
                employee.Skills = req.body.Skills
                employee.contact = req.body.contactnumber
                employee.ResumeFilename = req.file.filename
                employee.ResumeFileOriginalname = req.file.originalname
                employee.Certificate = cert;
                employee.save(function (err) {
                    res.redirect('/')
                })


            })


    };

    this.addVideo = function (req, res) {

        var cid = req.params.id;
        var week = req.body.week;

        course.findById(cid, function (err, course_info) {
            if (course_info == null)
                course_info = "no"
            res.render("addVideo", {
                course_info
            })
        });


    };



    this.saveVideo = function (req, res) {
        //console.log(req.file)
        //console.log(req.body)
        res.redirect("back")
    };

    this.delVideo = function (req, res) {
        var cname = req.body.course;
        var videoName = req.body.name;
        console.log(req.body)


        course.update({
                "name": cname
            }, {
                $pull: {
                    "material.vids": {
                        "name": videoName
                    }
                }
            })
            .exec(function (err, reslt) {
                console.log("delete this")
                res.redirect("back")
            })



    };

    this.addDocs = function (req, res) {

        var cid = req.params.id;
        var week = req.body.week;

        course.findById(cid, function (err, course_info) {
            if (course_info == null)
                course_info = "no"
            res.render("addDocs", {
                course_info
            })
        });



    };

    this.delDocument = function (req, res) {
        var cname = req.body.course;
        var videoName = req.body.name;
        console.log(req.body)


        course.update({
                "name": cname
            }, {
                $pull: {
                    "material.docs": {
                        "name": videoName
                    }
                }
            })
            .exec(function (err, reslt) {
                console.log("delete this")
                res.redirect("back")
            })



    };

    this.addCover = function (req, res) {
        res.render("addCover")
    }

    this.saveCover = function (req, res) {
        res.redirect("back")
    }


    this.addCourse = function (req, res) {
        var crs = new course();
        console.log(req.body);
        crs.name = req.body.course;
        crs.material.vids = [];
        crs.material.docs = [];
        crs.about = req.body.about;
        crs.prerequisite = req.body.prerequisite;
        crs.length = req.body.length;
        crs.effort = req.body.effort;
        crs.subject = req.body.subject;
        crs.level = req.body.level;
        crs.language = req.body.language;
        crs.coverurl = "t"
        crs.save(function (err) {
            res.redirect("back");
        });
    };

    this.showgraph = function (req, res) {


        Chartdatas.find({})
            .exec(function (err, chart_data) {
                res.render("graph", {
                    chart_data
                })
            })
    }


    this.addgraphdata = function (req, res) {

        var chartdata = new Chartdatas();
        console.log(req.body)

        chartdata.label = req.body.label
        chartdata.data = req.body.data;
        chartdata.save(function (err) {
            res.redirect("back")
        });


    }



    this.deletegraph = function (req, res) {

        var label_id = req.body.id;

        Chartdatas.findById(label_id).remove().exec(function (err) {
            res.redirect("back")
        });




    };

    this.enroll = function (req, res) {

        var cid = req.body.course;
        var cname = req.body.coursename;

        var enroll = new Enrolls();
        var chart = new Chartdatas();
        Enrolls.findOne({
                "username": req.user.name
            })
            .exec(function (err, enroll_info) {
                if (enroll_info == null) {
                    save();
                    addtograph();
                } else {
                    Enrolls.update({
                            "username": req.user.name
                        }, {
                            $push: {
                                "course": cid
                            }
                        })
                        .exec(function (err, result) {
                            addtograph();
                            res.redirect('/');
                        })
                }
            });

        function save() {
            enroll.username = req.user.name;
            enroll.course = cid;
            enroll.save(function (err) {
                res.redirect('/')
            })
        }

        function addtograph() {

            Chartdatas.findOne({
                    "label": cname
                })
                .exec(function (err, result) {
                    if (result == null) {
                        chart.label = cname;
                        chart.data = 1;
                        chart.save();
                    } else {
                        Chartdatas.update({
                                "label": cname
                            }, {
                                $inc: {
                                    "data": 1
                                }
                            })
                            .exec();
                    }
                })


        }


    };








};

module.exports = ClickHandler;