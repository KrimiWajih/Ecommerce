const mongoose = require("mongoose");
const OrdersSchema = new mongoose.Schema({
 user : {type : mongoose.Types.ObjectId , ref : "Users"},
 products :[{Product : {type : mongoose.Types.ObjectId , ref : "Products" , required : true},
            quantity :{type: Number}}],
orderDate: { type: Date,  default: Date.now},
total: { type: Number, required: true },
status :{type :String , default :"Pending" , enum : ["Pending","Successful"]},
sessionId: { type: String, default: null },

});
const Collection = mongoose.model("Orders", OrdersSchema);
module.exports = Collection;
