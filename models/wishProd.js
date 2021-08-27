const mongoose = require("mongoose");
const wishProdSchema = new mongoose.Schema({
  productId: {type: String},
  userId: {type: String}
});
module.exports = Admin = mongoose.model("wishProd", wishProdSchema);