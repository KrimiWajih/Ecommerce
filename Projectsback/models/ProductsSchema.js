const mongoose = require("mongoose");
const ProductsSchema = new mongoose.Schema({
    name : {type : String , required : true},
    description : {type : String ,required :true},
    category :{type : String , required :true},
    price :{type : Number , required :true},
    stock :{type : Number , required :true },
    images :[{type : String , required : true}],
    brand : {type : String , required :true}
});
const Collection = mongoose.model("Products", ProductsSchema);
module.exports = Collection;
