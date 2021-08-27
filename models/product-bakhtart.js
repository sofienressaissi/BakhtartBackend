const mongoose = require("mongoose");
const prodBakhtSchema = new mongoose.Schema({
  productName: {type: String},
  productDescription: {type: String},
  productPrice: {type: Number},
  productColor: {type: String},
  productSize: {type: String},
  productQuantity: {type: Number},
  productCategory: {type: String},
  productImage: {type: String},
  imageProdName: {type: String},
  productDisponibility: {type: Boolean},
  productAddedBy: {type: String},
  productPath: {type: String}
});
module.exports = Admin = mongoose.model("productBakhtart", prodBakhtSchema);