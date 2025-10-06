const jwt = require("jsonwebtoken");
const Users = require("../models/UserSchema")
exports.isauth = async (req,res,next)=>{
try {
    // const token = req.header("token");
    const token = req.cookies.token
  if(!token){
 return   res.status(400).send({Msg : "No token provided"})
  }
    const secretkey ="abc123";
    const verify = jwt.verify(token , secretkey);
   const user= await Users.findById(verify.id).populate("cart.Product");
  
    if(user){
            req.user =user;
            next();
        }else{
       return  res.status(400).send({ Msg: "Not authorized. Only admin" });
        }  
} catch (error) {
   return res.status(400).send({ Msg: "failed to verify " ,error });
}
}