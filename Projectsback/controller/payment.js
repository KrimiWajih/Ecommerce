const stripe = require("stripe");
const Users = require("../models/UserSchema");
const Products = require("../models/ProductsSchema");
const Orders = require("../models/OrdersSchema");
const secretkey = "sk_test_51QsOrwD5Bey0sAgQnDNrueTb6hz5HuTYW9c6AdXJRxrsPBBE44Xb3doo2ZmojhBEHD4QIccuethxRhcNvDEDfHlF00PrvxrCdR";
const Stripe = stripe(secretkey);

let ordertab = []; // Note: This array is global and could cause issues with multiple users; consider a better approach

const payment = async (req, res) => {
  //     const tokenuser = req.user.id;
  //   const UserFound = await Users.findById(tokenuser);
    const orderid = req.body.orderid;
    ordertab.push(orderid);
    const orderFound = await Orders.findById(orderid);
    if(orderFound.status ==="Pending"){
    try {
      const cart = orderFound.products;
      const line_items = [];
      for (let i = 0; i < cart.length; i++) {
        const product = cart[i].Product;
        const quantity = cart[i].quantity;
  
        const orderF = await Products.findById(product._id);
        line_items.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: orderF.name,
              description: orderF.description,
              images: orderF.images,
              metadata: { id: orderF._id.toString() },
            },
            unit_amount: orderF.price * 100,
          },
          quantity: quantity,
        });
      }
  
      const session = await Stripe.checkout.sessions.create({
        line_items,
        success_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/cancel",
        mode: "payment",
      });
      orderFound.sessionId = session.id;
      await orderFound.save();
      res.status(200).send({ Msg: "Session created", url: session.url });
  
    } catch (error) {
      res.status(500).send({ Msg: "Transaction Failed", error });
    }
  }else{
      res.status(500).send({Msg : "Order Already Paid"})
  }
  };


const success_payment = async (req, res) => {
  res.status(200).send({ Msg: "Thank you for your Order" });
  const updateorder = await Orders.findByIdAndUpdate(ordertab[0] , {status : "Successful"} ,{new : true} );
  ordertab.length=0;
};

const cancel_payment = (req, res) => {
  ordertab = []; // Clear the array on cancel
  res.status(500).send({ Msg: "Transaction Failed" });
};

const getpayment= async (req,res)=>{
  try {
    const list = await Orders.find({ sessionId: { $ne: null } })
    res.status(200).send({Msg :" your payment list" , list})
  } catch (error) {
    res.status(500).send({Msg :" failed to get your list" , error})
  }
}

const getSessions = async (req, res) => {
  try {
    const sessions = await Stripe.checkout.sessions.list({ limit: 5 });
    res.status(200).send({ Msg: "Sessions retrieved", sessions });
  } catch (error) {
    console.error("Error fetching sessions:", error.message);
    res.status(500).send({ Msg: "Failed to get sessions", error: error.message });
  }
};

// const getCartItems = async (req, res) => {
//   try {
//     const sessionId = req.params.sessionId; // Get session ID from request parameters

//     console.log("Fetching session ID:", sessionId);
    
//     // First, check if the session exists
//     const session = await Stripe.checkout.sessions.retrieve(sessionId);
//     console.log("Session retrieved:", session);

//     if (!session) {
//       return res.status(404).send({ Msg: "Checkout session not found" });
//     }

//     // Fetch the line items of the session
//     const lineItems = await Stripe.checkout.sessions.listLineItems(sessionId);

//     res.status(200).send({ Msg: "Cart items retrieved", items: lineItems });
//   } catch (error) {
//     console.error("Error fetching cart items:", error.message);
//     res.status(500).send({ Msg: "Failed to get cart items", error: error.message });
//   }
// };


const getCartItems = async (req, res) => {
  try {
    const sessionId = req.params.sessionId; // Get session ID from request parameters

    console.log("Fetching session ID:", sessionId);
    
    // Fetch the order using the sessionId from the Orders collection
    const order = await Orders.findOne({ sessionId }).populate("products.Product");

    if (!order) {
      return res.status(404).send({ Msg: "Order not found with the given sessionId" });
    }

    // Return the products from the order
    const cartItems = order.products.map(item => ({
      productId: item.Product,
      quantity: item.quantity,
    }));

    res.status(200).send({ Msg: "Cart items retrieved", items: cartItems });
  } catch (error) {
    console.error("Error fetching cart items:", error.message);
    res.status(500).send({ Msg: "Failed to get cart items", error: error.message });
  }
};




module.exports = { success_payment, cancel_payment, payment , getpayment , getCartItems , getSessions};
