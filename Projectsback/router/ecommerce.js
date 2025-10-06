const express = require("express");
const {
  signup,
  signin,
  addProduct,
  getOneProduct,
  deleteOneProduct,
  updateOneProduct,
  addOrder,
  getOneUser,
  addtocart,
  deletecart,
  deleteonecart,
  updateOneUser,
  getAllProduct,
  addManyproducts,
  getOneProduct1,
  getAllUsers,
  getCurrent,
  logout,
  updatecart,
  getOrders,
  getOneOrder,
} = require("../controller/control");
const { signupvalidation, validation } = require("../middleware/verif");
const { isauth } = require("../middleware/isAuth");
const { isauthuser } = require("../middleware/isAuthuser");
const { verifyEmail } = require("../controller/control");
const { payment, success_payment, cancel_payment, getpayment, getCartItems, getSessions } = require("../controller/payment");
const { insertMany } = require("../models/UserSchema");
const ERouter = express.Router();

//admin
ERouter.post("/addproduct",  addProduct);
ERouter.delete("/deleteproduct/:id", deleteOneProduct);
ERouter.put("/updateone", isauth, updateOneProduct);
ERouter.get("/getuser", isauth, getOneUser);
//user

ERouter.post("/Signup", signupvalidation, validation, signup);

// ERouter.post("/Signup",signup);
// ERouter.post("/Signin", signupvalidation, validation, signin);
ERouter.post("/Signin",  signin);
ERouter.post("/order", isauth,addOrder);
ERouter.post("/addtocart", isauth, addtocart);
ERouter.get("/getuser", isauthuser, getOneUser);
ERouter.get("/verify/:token", verifyEmail);
// ERouter.get("/findproduct", getOneProduct);
ERouter.get("/findproduct/:id", getOneProduct1);
ERouter.delete("/emptycart", isauth, deletecart);
ERouter.delete("/deleteonecart/:id", isauth, deleteonecart);
ERouter.put("/updateuser", isauthuser, updateOneUser);

ERouter.put("/updatecart/:id/:quantity" ,isauth , updatecart)


ERouter.get("/getcurrentU", isauth, getCurrent);
ERouter.post("/logout" , logout)
ERouter.get("/getorders" ,isauth,getOrders)


ERouter.get("/getproducts", getAllProduct);
ERouter.get("/getusers", getAllUsers  );
ERouter.post("/addproducts", addManyproducts);



ERouter.get("/orderid/:id" , getOneOrder)
ERouter.get("/getsessions", getSessions);
ERouter.get("/getCartItems/:sessionId" , getCartItems)
ERouter.get("/getpayment" , getpayment)
ERouter.post("/payment", payment);
ERouter.get("/success", success_payment);
ERouter.get("/cancel", cancel_payment);

module.exports = ERouter;
