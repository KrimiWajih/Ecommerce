const jwt = require("jsonwebtoken");
const Users = require("../models/UserSchema")
exports.isauthuser = async (req,res,next)=>{
try {
    const token = req.header("token");
  if(!token){
    res.status(400).send({Msg : "Login First"})
  }
    const secretkey ="abc123";
    const verify = jwt.verify(token , secretkey);
   const user= await Users.findById(verify.id);
   if(verify.role === "user" && user){
            req.user =user;
            next();
        }else{
         res.status(400).send({ Msg: "You are an admin" });
        }  
} catch (error) {
    res.status(400).send({ Msg: "failed to verify " ,error });
}
}