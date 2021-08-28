const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoryBakhtAdmin = new Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    categoryName: String,
    categoryImg: String,
    imageCatName: {type: String},
    categoryPath: String
})

module.exports = mongoose.model('categoryBakhtAdmin', categoryBakhtAdmin);