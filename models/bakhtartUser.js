const mongoose = require ("mongoose");

const fashionSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 4
    },
    lastName: {
        type: String,
        required: true,
        minlength: 4
    },
    username: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    emailToken: {
        type: String
    },
    isVerified: {
        type: Boolean
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    phoneNumber: {
        type: Number,
        required: true,
        length: 8
    },
    imageProfile: {
        type: String,
        required: false
    },
    firstAddress: {
        type: String,
        required: false
    },
    secondAddress: {
        type: String,
        required: false
    },
    region: {
        type: String,
        required: false
    },
    ville: {
        type: String,
        required: false
    },
    gender: {
        type: String,
        required: false
    },
    userState: {
        type: Boolean
    },
    roleBakht: {
        type: String
    },
    dateCreation: {
        type: Date
    }
});

module.exports = mongoose.model("bakhtart_user", fashionSchema);