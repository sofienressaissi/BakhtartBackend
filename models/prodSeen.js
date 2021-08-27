const mongoose = require("mongoose");
const prodSeenSchema = new mongoose.Schema({
  productId: {type: String},
  userId: {type: String},
  dateSeen: {type: Date}
});
module.exports = Admin = mongoose.model("productseen", prodSeenSchema);