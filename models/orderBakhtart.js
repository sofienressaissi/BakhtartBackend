const mongoose = require("mongoose");
const orderBakhtartSchema = new mongoose.Schema({
  productId: {type: String},
  userId: {type: String},
  quantityOrd: {type: Number},
  orderNumber: {type: String},
  stateOrd: {type: String},
  dateOrd: {type: Date}
});
module.exports = Admin = mongoose.model("orderBakhtart", orderBakhtartSchema);