const Users = require("../models/UserSchema");
const Products = require("../models/ProductsSchema");
const Orders = require("../models/OrdersSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// User Funcitons
exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  const secretkey = "abc123";
  try {
    const decodedToken = jwt.verify(token, secretkey);
    const user = await Users.findById(decodedToken.id);
    if (!user) {
      return res.status(404).send({ Msg: "User not found" });
    }
    if (user.status === "verified") {
      return res.status(400).send({ Msg: "Account already verified" });
    }
    user.status = "verified";
    await user.save();
    res.status(200).send({ Msg: "Account verified successfully!" });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(400).send({ Msg: "Invalid or expired token" });
    }
    res.status(500).send({ Msg: "Failed to verify account", error });
  }
};

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "wajihkurousagi@gmail.com",
      pass: "vagm seay dcmo ltnz",
    },
  });

  try {
    const userFound = await Users.findOne({ email });
    if (userFound) {
      return res.status(400).send({ Msg: "User already exists" });
    } else {
      const salt = 10;
      const hpassword = bcrypt.hashSync(password, salt);
      const NewUser = new Users({
        name,
        email,
        password: hpassword,
        status: "unverified",
      });
      const secretkey = "abc123";
      const token = jwt.sign(
        { id: NewUser._id, email: NewUser.email },
        secretkey,
        { expiresIn: "1h" }
      );
      const mailoptions = {
        to: email,
        subject: "Please Verify Your Account",
        html: `
          <h1>Welcome to our website</h1>
          <p>Please verify your account by clicking the link below:</p>
          <a href="http://localhost:3000/verifyaccount/${token}">Verify Account</a>
        `,
      };
      try {
        await transporter.sendMail(mailoptions);
        await NewUser.save();
        res.status(201).send({
          Msg: "User registered successfully. Please check your email for verification.",
        });
      } catch (error) {
        return res
          .status(500)
          .send({ Msg: "Failed to send verification email" });
      }
    }
  } catch (error) {
    res.status(500).send({ Msg: "Failed to Sign Up", error });
  }
};

// exports.signup = async (req, res) => {
//   const tokenvalid = req.params.token;
//   const { name, email, password } = req.body;
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "wajihkurousagi@gmail.com",
//       pass: "vagm seay dcmo ltnz",
//     },
//   });
//   try {
//     const userFound = await Users.findOne({ email });
//     if (userFound) {
//       res.status(400).send({ Msg: "User already exists" });
//     } else {
//       const NewUser = new Users(req.body);
//       const salt = 10;
//       const secretkey = "abc123";
//       const hpassword = bcrypt.hashSync(password, salt);
//       NewUser.password = hpassword;

//       await NewUser.save();
//       const token = jwt.sign(
//         {
//           id: NewUser._id,
//           name: NewUser.name,
//         },
//         secretkey,
//         {
//           expiresIn: "7d",
//         }
//       );
//       var mailoptions = {
//         to: email,
//         html: `
//         <h1>Welcome to our website </h1>
//         <p>Please Verify your account </p>
//        <a href= "http://localhost:5000/verify/${token}">Click here </a>
//         `,
//       };
//       try {
//         await transporter.sendMail(mailoptions);
//       } catch (error) {
//         return res
//           .status(500)
//           .send({ Msg: "Failed to send verification email" });
//       }

//       res
//         .status(201)
//         .send({
//           Msg: "User added successfully . Verification email is sent",
//           user: NewUser,
//           token,
//         });
//     }
//   } catch (error) {
//     res.status(500).send({ Msg: "Failed to Sign Up" });
//   }
// };

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userFound = await Users.findOne({ email });
    if (!userFound) {
      res.status(400).send({ Msg: "User not found" });
    } else {
      const match = bcrypt.compareSync(password, userFound.password);
      if (!match) {
        res.status(500).send({ Msg: "Wrong Password" });
      } else {
        const secretkey = "abc123";
        const token = jwt.sign(
          { id: userFound._id, name: userFound.name, role: userFound.role },
          secretkey,
          {
            expiresIn: "1d",
          }
        );
   //with cookies

   res.cookie("token",token,{httpOnly : true , maxAge : 60*60*24*7*1000})  // http only  so we cant get it using javascript for more secure way
   res
   .status(200)
   .send({ Msg: "Login Successful", User: userFound});

   //with token
        // res
        //   .status(200)
        //   .send({ Msg: "Login Successful", User: userFound, token });
       
      }
    }
  } catch (error) {
    res.status(500).send({ Msg: "Failed to login" });
  }
};


exports.logout = (req,res)=>{
  res.clearCookie("token" , {httpOnly : true});
  res.status(200).send({Msg :"Logged out"})
  console.log("logged out")
}

exports.addProduct = async (req, res) => {
  try {
    const NewProduct = new Products(req.body);
    await NewProduct.save();
    res.status(201).send({ Msg: "Product Added Successfully" });
  } catch (error) {
    res.status(500).send({ Msg: "Failed to Add Product" });
  }
};

exports.getOneProduct = async (req, res) => {
  try {
    const ProductFound = await Products.findById(req.body.id);
    res.status(200).send({ Msg: " Product Found", Product: ProductFound });
  } catch (error) {
    res.status(500).send({ Msg: " Product not Found" });
  }
};

exports.deleteOneProduct = async (req, res) => {
  try {
    const ProductFound = await Products.findById(req.params.id);
    if (ProductFound == null) {
      res.status(400).send({ Msg: "Product not found" });
    } else {
      const deleteone = await Products.findByIdAndDelete(req.params.id);
      res
        .status(200)
        .send({ Msg: "Product found and deleted", DeletedProduct: deleteone });
    }
  } catch (error) {
    res.status(200).send({ Msg: "Failed to Delete/ Not Found", error });
  }
};

exports.updateOneProduct = async (req, res) => {
  try {
    const ProductFound = await Products.findById(req.body.id);
    if (ProductFound == null) {
      res.status(400).send({ Msg: "Product not found" });
    } else {
      const updateone = await Products.findByIdAndUpdate(
        req.body.id,
        { ...req.body },
        { new: true }
      );
      res
        .status(200)
        .send({ Msg: "Product found and updated", UpdatedProduct: updateone });
    }
  } catch (error) {
    res.status(500).send({ Msg: "Failed to Update", error });
  }
};

exports.addOrder = async (req, res) => {
  const tokenuser = req.user.id; // Extract user ID from req.user (assuming isauth middleware sets req.user)

  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products)) {
      return res.status(400).send({ Msg: "Products must be provided as an array" });
    }

    let total = 0;
    for (let item of products) {
      const product = await Products.findById(item.Product);
      if (!product) {
        return res
          .status(404)
          .send({ Msg: `Product with ID ${item.Product} not found` });
      }
      const productTotal = product.price * item.quantity;
      total += productTotal;
    }

    // Create new order with user ID (renamed tokenuser to user for clarity)
    const NewOrder = new Orders({ user: tokenuser, products, total });
    const userFound = await Users.findById(tokenuser);

    if (!userFound) {
      return res.status(404).send({ Msg: "User not found" });
    }

    await NewOrder.save();
    await NewOrder.populate("user"); // Populate the "user" field
    await NewOrder.populate("products.Product"); // Populate "Product" in products array
    userFound.Orders.push(NewOrder._id); // Push the order ID to user's Orders array
    await userFound.save();

    // Return the order ID explicitly
    res.status(201).send({
      Msg: "Order Made Successfully",
      orderId: NewOrder._id.toString(), // Convert ObjectId to string for frontend
    });
  } catch (error) {
    console.error("Error in addOrder:", error); // Log error for debugging
    res.status(500).send({ Msg: "Failed to order" }); // Fixed typo
  }
};

exports.getOrders = async (req, res) => {
  try {
    const allorders = await Orders.find().populate("user"); 
    res.status(200).send({ Msg: "All orders", Orders: allorders });
    console.log(allorders); 
  } catch (error) {
    console.error("Error getting orders:", error);
    res.status(400).send({ Msg: "Error getting orders", error });
  }
};

exports.getOneOrder = async (req,res)=>{
  const id = req.params.id;
try {
  const orderid = await Orders.findById(id).populate("products products.Product")
res.status(200).send({Msg : " Order Found " , Order : orderid})
} catch (error) {
  res.status(500).send({Msg : "Error fetching order data" , error})
}
}


exports.getOneUser = async (req, res) => {
  try {
    const UserFound = await Users.findById(req.body.id);
    await UserFound.populate("cart.Product");
    res.status(200).send({ Msg: " User Found", User: UserFound });
  } catch (error) {
    res.status(500).send({ Msg: " User not Found" });
  }
};

exports.addtocart = async (req, res) => {
  try {
    const UserFound = req.user;
    if (!UserFound) {
      return res.status(401).send({ Msg: "User not authenticated" });
    }

    console.log("User found:", UserFound);
    console.log("User Cart before adding:", UserFound.cart);

    const ProductFound = await Products.findById(req.body.Product);
    if (!ProductFound) {
      return res.status(404).send({ Msg: "Product not found" });
    }

    const quantity = req.body.quantity || 1;

    if (!UserFound.cart) {
      UserFound.cart = [];
    }

    // 🛠 Fix: Ensure the product comparison is correct
    const existingCartItem = UserFound.cart.find(
      (item) => item.Product._id.toString() === ProductFound._id.toString()
    );

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      console.log("Updated quantity:", existingCartItem.quantity);
    } else {
      UserFound.cart.push({ Product: ProductFound._id, quantity });
      console.log("Added new product to cart");
    }

    await UserFound.save();

    console.log("User Cart after adding:", UserFound.cart);

    res.status(201).send({
      Msg: "Product Added to cart",
      cart: UserFound.cart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).send({ Msg: "Failed to add product", error });
  }


};


exports.deletecart = async (req, res) => {
  const tokenuser = req.user.id;
  const userFound = await Users.findById(tokenuser);

  // const userFound = await Users.findById(req.body.id);
  try {
    if (!userFound) {
      return res.status(500).send({ Msg: "User not found" });
    }
    userFound.cart = [];
    await userFound.save();
    res.status(200).send({ Msg: "Cart Emptied successfully" });
  } catch (error) {
    res.status(500).send({ Msg: "Failed to empty cart" });
  }
};

exports.updatecart = async (req,res)=>{
  const userid = req.user.id;
  const productid =req.params.id
  const userFound = await Users.findById(userid)
  const updatedquantity = req.params.quantity
  console.log(productid,updatedquantity)
  try {
  usercart = userFound.cart
  const updatedcart = usercart.map((el)=> el.Product._id.toString() === productid ? {...el, quantity : updatedquantity} : el)
  userFound.cart = updatedcart
  await userFound.save();
   return res
      .status(200)
      .send({ Msg: "Cart item quantity was updated Successfully", updatedcart });
  } catch (error) {
   return res.status(500).send({ Msg: "Item not found", error });
  }
}



exports.deleteonecart = async (req, res) => {
  try {
    const tokenuser = req.user.id;
    const productid = req.params.id
 console.log(tokenuser)

    const userFound = await Users.findById(tokenuser);
    console.log(productid)
    //const userFound = await Users.findById(req.body.id);
    if (!userFound) {
      return res.status(400).send({ Msg: "User not found" });
    }
    const updatedCart = userFound.cart.filter(
      (item) => item.Product._id.toString() !== productid
    );

    //const result = await Users.updateOne({_id: req.body.id , $pull :{cart : req.body.itemid}})

    userFound.cart = updatedCart;
    await userFound.save();
    res
      .status(200)
      .send({ Msg: "Cart item deleted Successfully", updatedCart });
  } catch (error) {
    res.status(500).send({ Msg: "Item not found", error });
  }
};

// exports.updateOneUser = async (req, res) => {
//   try {
//     const token = req.header("token");
//   if(!token){
//     res.status(400).send({Msg : "Login First"})
//   }
//     const secretkey ="abc123";
//     const verify = jwt.verify(token , secretkey);
//    const UserFound= await Users.findById(verify.id);
//     //const UserFound = await Users.findById(token.id);
//     if (UserFound == null) {
//       res.status(400).send({ Msg: "User not found" });
//     } else {
//       const updateone = await Users.findByIdAndUpdate(
//         verify.id,
//         { ...req.body },
//         { new: true }
//       );
//       res
//         .status(200)
//         .send({ Msg: "User found and updated", UpdatedUser: updateone });
//     }
//   } catch (error) {
//     res.status(500).send({ Msg: "Failed to Update", error });
//   }
// };

exports.updateOneUser = async (req, res) => {
  try {
    const tokenuser = req.user.id;
    const UserFound = await Users.findById(tokenuser);
    if (UserFound == null) {
      res.status(400).send({ Msg: "User not found" });
    } else {
      const updateone = await Users.findByIdAndUpdate(
        tokenuser,
        { ...req.body },
        { new: true }
      );
      res
        .status(200)
        .send({ Msg: "User found and updated", UpdatedUser: updateone });
    }
  } catch (error) {
    res.status(500).send({ Msg: "Failed to Update", error });
  }
};

exports.getAllProduct = async (req, res) => {
  try {
    const ProductFound = await Products.find();
    res.status(200).send({ Msg: " Product Found", Product: ProductFound });
  } catch (error) {
    res.status(500).send({ Msg: " Product not Found" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const UserFound = await Users.find();
    res.status(200).send({ Msg: "User Found", User: UserFound });
  } catch (error) {
    res.status(500).send({ Msg: " User not Found" });
  }
};

exports.addManyproducts = async (req, res) => {
  try {
  
    const  products  = req.body;
    console.log(products)
    // if (!products || !Array.isArray(products)) {
    //   return res.status(400).json({ success: false, message: "Invalid product data" });
    // }

    await Products.insertMany(products);
    res.status(201).json({ success: true, message: "Products added successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error adding products", error: err.message });
  }
};

exports.getOneProduct1 = async (req, res) => {
  try {
    const ProductFound = await Products.findById(req.params.id);
    res.status(200).send({ Msg: " Product Found", Product: ProductFound });
  } catch (error) {
    res.status(500).send({ Msg: " Product not Found" });
  }
};

exports.getCurrent = async (req,res)=>{
  try {
   const user = req.user 
   res.status(200).send({Msg : "Connecting User" , User : user})
  } catch (error) {
   res.status(400).send({Msg : "Login first"})
  } 
 }