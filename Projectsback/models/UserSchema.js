const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
    name : {type : String , required : true},
   email :{type : String , required : true},
   password :{type : String ,required : true},
   role :{type : String  , default : "user",enum: ["admin", "user"]},
   status: {
    type: String,
    default: "unverified", 
    enum: ["unverified", "verified"],  
  },
   Orders : [ {type : mongoose.Types.ObjectId , ref : "Orders" }],
   cart:[{Product : {type : mongoose.Types.ObjectId , ref : "Products" },
               quantity :{type: Number}}]
});
const Collection = mongoose.model("Users", UserSchema);
module.exports = Collection;
