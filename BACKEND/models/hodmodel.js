var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var dbconfig = require("../config/db");

var HodSchema = mongoose.Schema({
  userid:{ 
      type: String, 
      unique: true, 
      require: true 
  },
  name:{ 
      type: String 
  },
  qualification:{
    type: String
  },
  phone:{
      type: String 
  },
  email:{
      type: String 
  },
  address:{
    type: String
  },
  dept:{
      type: String,
      unique: true,
      require: true
  },
  role:{
    type: String,
    required: true
  }
});

const HOD = module.exports = mongoose.model("hods",HodSchema);

// module.exports.getHodById = function(id,callback){
//   HOD.findById(id,callback);
// }

module.exports.getHodByUserId = function(userid,callback){
  HOD.findOne({userid:userid},callback);
}


module.exports.addHod = function(newhod,callback){
      newhod.save(callback);
}