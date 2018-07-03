var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('jsonwebtoken');
var config = require('../config/db');
const User = require('../models/usermodel');
const Student = require('../models/studentmodel');
const HOD = require('../models/hodmodel');
const TPO = require('../models/tpomodel');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource:users');
});

router.post('/login', function(req, res, next) {
  var userid = req.body.userid;
  var password = req.body.password;
  var token;
  User.getUserByUserId(userid,function(err,user){
    if(err) throw err;
    if(!user){
      return res.json({success:false,msg:"user not found."});
    }
    User.compareUserPassword(password,user.password,function(err,ismatch){
      if(err) throw err;
      if(ismatch){
        //code to get profile
        if(user.role=='student'){
          Student.getStudentByUserId(userid,function(err,userdata){
            if(err) throw err;
            if(!userdata){
              return res.json({success: false,msg:"student not found."});
            }else{
              token = jwt.sign(userdata.toObject(), config.secret, {expiresIn: 3600 });
              return res.json({success:true,msg:"Student login success.",token: "Bearer "+token,user:userdata});
            }
          });
        }
        else if(user.role=='hod'){
          HOD.getHodByUserId(userid,function(err,userdata){
            if(err) throw err;
            if(!userdata){
              return res.json({success: false,msg:"HOD not found."});
            }else{
              token = jwt.sign(userdata.toObject(), config.secret, {expiresIn: 3600 });
              return res.json({success:true,msg:"HOD login success.",token: "Bearer "+token,user:userdata});
            }
          });
        }
        else if(user.role=='tpo'){
          TPO.getTpoByUserId(userid,function(err,userdata){
            if(err) throw err;
            if(!userdata){
              return res.json({success: false,msg:"TPO not found."});
            }else{
              token = jwt.sign(userdata.toObject(), config.secret, {expiresIn: 3600 });
              return res.json({success:true,msg:"TPO login success.",token: "Bearer "+token,user:userdata});
            }
          });
        }
        else if(user.role=='admin'){
          token = jwt.sign(user.toObject(), config.secret, {expiresIn: 3600 });
          return res.json({success:true,msg:"Admin login success.",token: "Bearer "+token,user:user});
        }
        else{
          return res.json({success: false,msg:"unknown role found"});
        }
        
      }else{
        return res.json({success:false,msg:"wrong password."});
      }
    });
  });
});

router.post('/adduser',function(req,res,next){
  var newuser = new User();
  newuser.userid =req.body.userid;
  newuser.password =req.body.password;
  newuser.role =req.body.role;
  // User.addUser(newuser, function(err,user){
  //       if(err){
  //         res.json({success:false , msg:"UserID Already Exist in users."});
  //       }else{
  //         res.json({success:true , msg:"added in users."});
  //       }
  //     });
  //   });
  var roleUser;
  if(newuser.role=="student"){
    roleUser = new Student();
    roleUser.userid =req.body.userid;
    //roleUser.password =req.body.password;
    roleUser.role = req.body.role;
    roleUser.dept = req.body.dept;
    User.addUser(newuser, function(err,user){
      if(err){
        res.json({success:false , msg:"UserID Already Exist in users."});
      }else{
        Student.addStudent(roleUser,function(err,user){
          if(err){
            res.json({success:false , msg:"add student failed."});
          }else{
            res.json({success:true , msg:"success in add student"});
          }
        });
      }
    });
  }
  else if(newuser.role=='hod'){
    roleUser = new HOD();
    roleUser.userid =req.body.userid;
    //roleUser.password =req.body.password;
    roleUser.role = req.body.role;
    roleUser.dept = req.body.dept;
    User.addUser(newuser, function(err,user){
      if(err){
        console.log(err);
        res.json({success:false , msg:"UserID Already Exist in users."});
      }
      else{
        HOD.addHod(roleUser,function(err,hoduser){
          if(err){
            User.removeUserByUserId(req.body.userid,function(err,result){
              if(err){
                console.log(err);
              }
              else{
                console.log(result);
              }
            })
            res.json({success:false , msg:"HOD For this Dept Already exist."});
          }
          else{
            res.json({success:true , msg:"success in add HOD."});
          }
        });
      }
    });
  }
  else if(newuser.role=='tpo'){
    roleUser = new TPO();
    roleUser.userid =req.body.userid;
    //roleUser.password =req.body.password;
    roleUser.role = req.body.role;
    User.addUser(newuser, function(err,user){
      if(err){
        res.json({success:false , msg:"UserID Already Exist in users."});
      }else{
        TPO.addTpo(roleUser,function(err,user){
          if(err){
            res.json({success:false , msg:"add TPO failed."});
          }else{
            res.json({success:true , msg:"success in add TPO."});
          }
        });
      }
    });
  }
  else if(newuser.role=="admin"){
    User.addUser(newuser, function(err,user){
      if(err){
        res.json({success:false , msg:"UserID Already Exist."});
      }else{
        res.json({success:true , msg:"success in add admin."});
      }
    });
  }
  else
    res.json({success:false , msg:"role can't be accepted"});
  });

router.get('/profile',passport.authenticate("jwt",{session:false}), function(req, res, next) {
  res.json({user: req.user});
});

//GET All Users

router.get('/getallusers', function(req, res, next) {
  User.getAllUsers(function(err,userdata){
    res.json(userdata);
  });
});

//GET Student By Department
router.get('/getstudentbydept/:dept', function(req, res, next) {
  Student.getStudentByDept(req.params.dept,function(err,userdata){
    res.json(userdata);
  });
});

//GET Student By Dept and Id
router.get('/getstudentbydeptuserid/:dept/:id', function(req, res, next) {
  Student.getStudentByDeptUserId(req.params.dept,req.params.id,function(err,userdata){
    res.json(userdata);
  });
});

//GET Students By Dept and Year

router.get('/getstudentbydeptyear/:dept/:year', function(req, res, next) {
  Student.getStudentByDeptYear(req.params.dept,req.params.year,function(err,userdata){
    res.json(userdata);
  });
});

//GET Students

router.get('/getallstudents', function(req, res, next) {
  Student.getAllStudents(function(err,data){
    res.json(data);
  });
});

//GET all HODs
router.get('/getallhods', function(req, res, next) {
  //res.send('respond with a resource:users');
  HOD.getAllHods(function(err,userdata){
    res.json(userdata);
  });
});

//GET all TPOs
router.get('/getalltpos', function(req, res, next) {
  //res.send('respond with a resource:users');
  TPO.getAllTpos(function(err,userdata){
    res.json(userdata);
  });
});

//Update Students Add Remaining fields storing also
router.put('/updateuser/:userid', function(req, res, next) {
  User.getUserByUserId(req.params.userid,function(err,user){
    if(err)
    {
      res.json({"error":err});
    }
    else if(!user){
     res.json({success:false,msg:"User Not Found"});
    }
    else 
    {
      //console.log(user);
      if(user.role=="student")
      {
        Student.update({userid:req.params.userid},
          {
            name:req.body.name,
            dob:req.body.dob,
            phone:req.body.phone, 
            email:req.body.email,
            aggregate:req.body.aggregate,
            address:req.body.address,
            year:req.body.year
          },
          function(err,result){
            if(err){
              res.json(err);}
            else if(result.n==1){
              res.json({success:true,msg:"Updated"}); 
            }
            else{
              res.json({success:false,msg:json.stringify(result)});
            }
          });
      }
      //Update HOD
      else if(user.role=="hod")
      {
        HOD.update({userid:req.params.userid},
          {
            name:req.body.name,
            qualification:req.body.qualification,
            phone:req.body.phone, 
            email:req.body.email,
            address:req.body.address
          },
          function(err,result){
            if(err){
              res.json(err);}
            else if(result.n==1){
              res.json({success:true,msg:"Updated"}); 
            }else{
              res.json({success:false,msg:json.stringify(result)});
            }
          });
      }
      //Update TPO
      else if(user.role=="tpo")
      {
        TPO.update({userid:req.params.userid},
          {
            name:req.body.name,
            qualification:req.body.qualification,
            phone:req.body.phone, 
            email:req.body.email,
            address:req.body.address
          },
          function(err,result){
            if(err){
              res.json(err);}
            else if(result.n==1){
              res.json({success:true,msg:"Updated"}); 
            }else{
              res.json({success:false,msg:json.stringify(result)});
            }
          });
      }
      else{
        console.log("Invalid Update");
        res.json({success:false,msg:"Invalid Update"});
      }
    }
    
  })
});


router.post('/forgotpaswd', function(req, res, next) {
  var userid = req.body.userid;
  var oldpassword = req.body.oldpassword;
  var newpassword = req.body.newpassword;
  var confpassword = req.body.confpassword;
  if(newpassword==confpassword){
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newpassword, salt, (err, hash) => {
        if(err) throw err;
        newpassword = hash;
        console.log(newpassword);
      });
    });
  User.getUserByUserId(userid,function(err,user){
    if(err) throw err;
    //console.log(user.password);
    if(!user){
      return res.json({success:false,msg:"user not found."});
    }
      //console.log(oldpassword);
      //console.log(user.password);
      User.compareUserPassword(oldpassword,user.password,function(err,ismatch){
        if(err) throw err;
        if(ismatch){
          //Logic to Update Password in allusers Coll.
          User.findOneAndUpdate({userid:userid},{
            $set:{
                password:newpassword,
            }
            },
            function(err,result){
                if(err)
                {
                    res.json(err);
                }
                else
                {
                  console.log("Password Updated Succesfully in Alluser Coll.");
                  //res.json(result);
                }
        });
          if(user.role=='student'){
            Student.getStudentByUserId(userid,function(err,userdata){
              if(err) throw err;
              if(!userdata){
                return res.json({success: false,msg:"student not found."});
              }else{
                //Logic to Update Password in Student Coll.
                  
                  Student.findOneAndUpdate({userid:userid},{
                    $set:{
                        password:newpassword,
                    }
                    },
                    function(err,result){
                        if(err)
                        {
                            res.json(err);
                        }
                        else
                        {
                          console.log("Student Password Updated Succesfully in Studnt Coll.");
                          res.json(result);
                        }
                });
              }
            });
          }
          else if(user.role=='hod'){
            HOD.getHodByUserId(userid,function(err,userdata){
              if(err) throw err;
              if(!userdata){
                return res.json({success: false,msg:"HOD not found."});
              }else{
                //Logic to Update Password in hod Coll.

                  HOD.findOneAndUpdate({userid:userid},{
                    $set:{
                        password:newpassword,
                    }
                    },
                    function(err,result){
                        if(err)
                        {
                            res.json(err);
                        }
                        else
                        {
                            res.json(result);
                        }
                });
              }
            });
          }
          else if(user.role=='tpo'){
            TPO.getTpoByUserId(userid,function(err,userdata){
              if(err) throw err;
              if(!userdata){
                return res.json({success: false,msg:"TPO not found."});
              }else{
                //Logic to Update Password in tpo Coll.

                    
                  TPO.findOneAndUpdate({userid:userid},{
                    $set:{
                        password:newpassword,
                    }
                    },
                    function(err,result){
                        if(err)
                        {
                            res.json(err);
                        }
                        else
                        {
                            res.json(result);
                        }
                });

              }
            });
          }
          else{
            return res.json({success: false,msg:"Admin Password Updated Succesfully"});
          }
          
        }else{
          return res.json({success:false,msg:"password update failed, Please Enter Correct Old Pasword"});
        }
      });
  });
}
else{
  console.log("Confirm Password and New Password Need to be Matched");
}
});


module.exports = router;
