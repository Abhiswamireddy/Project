var express = require('express');
var router = express.Router();
const User = require('../models/usermodel');
const Student = require('../models/studentmodel');
const HOD = require('../models/hodmodel');
const TPO = require('../models/tpomodel');

router.get('/getstudent/:userid', function(req, res, next) {
    Student.getStudentByUserId(req.params.userid,function(err,student){
      res.json(student);
    });
  });

module.exports = router;