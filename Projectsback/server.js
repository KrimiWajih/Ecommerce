const express = require("express");
const  {config}  = require("./configuration/config");
const ERouter = require("./router/ecommerce");
const cors =require("cors") 
const cookieParser = require("cookie-parser")

  // install cookie-parser 
const port = 5000 ;
const app = express();

app.use(
    cors({
      origin: "https://ecommerce-1-li0a.onrender.com/",
      credentials: true, 
    })
  );
  
app.use(express.json());
app.use(cookieParser())
config();
app.use("/" , ERouter)

app.listen(port , console.log("Server is Running "));
