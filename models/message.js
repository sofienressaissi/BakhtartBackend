const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({
  firstName: {type: String},
  lastName: {type: String},
  email: {type: String},
  subject: {type: String},
  content: {type: String}
});
module.exports = Admin = mongoose.model("message", messageSchema);