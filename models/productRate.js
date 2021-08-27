const mongoose = require("mongoose");
const prodRateSchema = new mongoose.Schema({
  rateValue: {type: Number},
  productId: {type: String},
  userId: {type: String}
});
module.exports = Admin = mongoose.model("prodrate", prodRateSchema);