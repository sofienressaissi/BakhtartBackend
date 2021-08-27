const mongoose = require("mongoose");
const cartBakhtartSchema = new mongoose.Schema({
  productId: {type: String},
  userId: {type: String},
  quantityMin: {type: Number},
  orderNumber: {type: String}
});
module.exports = Admin = mongoose.model("cartBakhtart", cartBakhtartSchema);