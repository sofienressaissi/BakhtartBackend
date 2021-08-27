const mongoose = require ("mongoose");

const fpfSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("forgetpass_fashion", fpfSchema);