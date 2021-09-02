const router = require("express").Router();
const bcrypt = require("bcrypt");
require('dotenv').config();
const mongoose = require("mongoose");
const fashion = require('../models/bakhtartUser');
const productBakhtart = require('../models/product-bakhtart');
const cartBakht = require('../models/cartBakhtart');
const orderBakht = require('../models/orderBakhtart');
const wishProduct = require('../models/wishProd');
const productSeen = require('../models/prodSeen');
const prodRate = require('../models/productRate');
const categoryBakhtart = require('../models/categoryBakhtAdmin');
const msg = require('../models/message');
var randomstring = require("randomstring");
const Verifier = require("email-verifier");
let verifier = new Verifier("at_fbYHeD2J55059T4krj83uGu7XN7ul");

router.post('/add-new-user', async(req, res) => {
    res.setHeader("Content-Type", "text/html");
    try {
        let {
            firstName,
            lastName,
            username,
            email,
            phoneNumber
        } = req.body
        if (!firstName || !lastName || !phoneNumber || !email) {
            return res.status(400).json({msg: "Not all fields have been entered"});
        }
        if (phoneNumber.length < 8) {
            return res.status(400).json({msg: "The phone number needs to be at least 8 numbers long"});
        }
        if (firstName.length < 4) {
            return res.status(400).json({msg: "The first name needs to be at least 4 characters long"});
        }
        if (lastName.length < 4) {
            return res.status(400).json({msg: "The last name needs to be at least 4 characters long"});
        }
        const existingFashion = await fashion.findOne({
            email: email
        })
        const existingFashionPhone = await fashion.findOne({
            phoneNumber: phoneNumber
        })
        if (existingFashionPhone) {
            return res.status(400).json({msg: "An account with this phone number already exists"});
        }
        if (existingFashion) {
            return res.status(400).json({msg: "An account with this email already exists"});
        }
        if (email === "bakhtartfashion@gmail.com") {
            return res.status(400).json({msg: "You can't use this email address"});
        }
        if (!username) {
            username = email
        }
        let password = randomstring.generate(8);
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const newFashion = new fashion({
            dateCreation: Date.now(),
            userState: true,
            roleBakht: "user",
            firstName,
            lastName,
            username,
            email,
            password: passwordHash,
            emailToken: "",
            isVerified: true,
            phoneNumber: phoneNumber,
            imageProfile: "unknownAvatar.jpg",
            firstAddress: "",
            secondAddress: "",
            region: "",
            ville: "",
            gender: "",
        })
        const savedFashion = await newFashion.save();
        res.json(savedFashion);
    } catch (err) {
        res.status(500).json(err.message);
    }
})

router.post('/add-category', async(req, res) => {
    try {
        let {
            categoryName,
            categoryImg,
            imageCatName,
            categoryPath
        } = req.body
        if (!categoryName) {
            return res.status(400).json({msg: "Category name is required!"});
        }
        if (!categoryImg) {
            return res.status(400).json({msg: "Category image is required!"});
        }
        var firstChar = categoryName.charAt(0);
        if (firstChar !== firstChar.toUpperCase()) {
            return res.status(400).json({msg: "Category Name must start with an upper case!"});
        }
        const existingCatBakht = await categoryBakhtart.findOne({
            categoryName: categoryName
        })
        const existingCatImgBakht = await categoryBakhtart.findOne({
            imageCatName: imageCatName
        })
        if (existingCatBakht) {
            return res.status(400).json({msg: "This category already exists!"});
        }
        if (existingCatImgBakht) {
            return res.status(400).json({msg: "This category already exists!"});
        }
        const allMinChars = categoryName.toLowerCase();
        categoryPath = allMinChars.replace(/ /g,'');
        const newCatBakht = new categoryBakhtart({
            categoryName,
            categoryImg,
            imageCatName,
            categoryPath
        })
        const savedCatAdmin = await newCatBakht.save();
        res.json(savedCatAdmin);
    } catch (err) {
        res.status(500).json(err.message);
    }
})

router.post('/add-product/:adminId', async(req, res) => {
    try {
        let {
            productName,
            productDescription,
            productPrice,
            productColor,
            productSize,
            productQuantity,
            productCategory,
            productImage,
            imageProdName,
            productDisponibility,
            productAddedBy,
            productPath
        } = req.body
        if (!productName || !productDescription || !productPrice || !productColor || !productQuantity
            || !productImage) {
            return res.status(400).json({msg: "Not all fields have been entered!"});
        }
        if (!productCategory) {
            productCategory = "bathingcapes";
        }
        var firstChar = productName.charAt(0);
        if (firstChar !== firstChar.toUpperCase()) {
            return res.status(400).json({msg: "Product Name must start with an upper case!"});
        }
        const existingProductBakht = await productBakhtart.findOne({
            productName: productName
        })
        const existingProdImgBakht = await productBakhtart.findOne({
            imageProdName: imageProdName
        })
        const existingAdminBakht = await fashion.findOne({
            _id: mongoose.Types.ObjectId(req.params.adminId)
        })
        if (existingProductBakht) {
            return res.status(400).json({msg: "This product already exists!"});
        }
        if (existingProdImgBakht) {
            return res.status(400).json({msg: "This product already exists!"});
        }
        const allMinChars = productName.toLowerCase();
        productPath = allMinChars.replace(/ /g,'');
        productDisponibility = true;
        productAddedBy = `${existingAdminBakht.firstName} ${existingAdminBakht.lastName}`;
        const newProductBakht = new productBakhtart({
            productName,
            productDescription,
            productPrice,
            productColor,
            productSize,
            productQuantity,
            productCategory,
            productImage,
            imageProdName,
            productDisponibility,
            productAddedBy,
            productPath
        })
        const savedProductAdmin = await newProductBakht.save();
        res.json(savedProductAdmin);
    } catch (err) {
        res.status(500).json(err.message);
    }
})
router.get('/allBakhtUsers', async(req, res) => {
    fashion.find(null, function (err, list_bakhtUsers) {
        if (err) {
            throw err;
        }
        res.send(list_bakhtUsers);
    })
})
router.get('/allBakhtProdsAdmin', async(req, res) => {
    productBakhtart.find(null, function (err, list_bakhtadminprods) {
        if (err) {
            throw err;
        }
        res.send(list_bakhtadminprods);
    })
})
router.delete('/delete-prod/:productId', async (req, res) => {
    try {
        const existingProduct = await productBakhtart.findByIdAndDelete(req.params.productId);
        res.json(existingProduct);
        console.log("Product Deleted");
    } catch (err) {
        res.status(500).json(err.message);
    }
})
router.delete('/delete-user-account/:userId', async (req, res) => {
    try {
        let query = {userId: req.params.userId};
    
    const existedCart = await cartBakht.find({userId: req.params.userId});
    const existedOrder = await orderBakht.find({userId: req.params.userId});
    const existedOrderProcessing = await orderBakht.count({userId: req.params.userId, stateOrd: 'Processing'});
    const existedOrderDelivering = await orderBakht.count({userId: req.params.userId, stateOrd: 'Delivering'});
    const existProdSeen = await productSeen.find({userId: req.params.userId});
    const existedProdRate = await prodRate.find({userId: req.params.userId});
    const existedWishProd = await wishProduct.find({userId: req.params.userId});
    if (existedOrderProcessing > 0 || existedOrderDelivering > 0) {
        return res.status(400).json({msg: "Account couldn't be deleted! It may contain processing/in delivering products!"});
    }
    if (existedOrderProcessing === 0 && existedOrderDelivering === 0) {
        if (existedCart) {
            await cartBakht.deleteMany(query);
        }
        if (existedOrder) {
            await orderBakht.deleteMany(query);
        }
        if (existProdSeen) {
            await productSeen.deleteMany(query);
        }
        if (existedProdRate) {
            await prodRate.deleteMany(query);
        }
        if (existedWishProd) {
            await wishProduct.deleteMany(query);
        }
         let userToDelete = await fashion.findByIdAndDelete(req.params.userId);
        res.json(userToDelete);
    }
    } catch (err) {
        res.status(500).json(err.message);
    }
})
router.put("/update-account/:adminId", async (req, res) => {
    try {
        let {
            firstName,
            lastName,
            username,
            email,
            phoneNumber
        } = req.body;
        if (phoneNumber && phoneNumber.length < 8) {
            return res.status(400).json({msg: "The phone number needs to be at least 8 numbers long"});
        }
        if (firstName && firstName.length < 4) {
            return res.status(400).json({msg: "The first name needs to be at least 4 characters long"});
        }
        if (lastName && lastName.length < 4) {
            return res.status(400).json({msg: "The last name needs to be at least 4 characters long"});
        }
        const existingAB = await fashion.findOne({
            email: email
        })
        const existingABPhone = await fashion.findOne({
            phoneNumber: phoneNumber
        })
        if (existingABPhone) {
            return res.status(400).json({msg: "An account with this phone number already exists"});
        }
        if (existingAB) {
            return res.status(400).json({msg: "An account with this email already exists"});
        }
        const adminToUpdate = await fashion.findById(req.params.adminId);
        if (!firstName) {
            firstName = adminToUpdate.firstName;
        }
        if (!lastName) {
            lastName = adminToUpdate.lastName;
        }
        if (!username) {
            username = adminToUpdate.username;
        }
        if (!email) {
            email = adminToUpdate.email;
        }
        if (!phoneNumber) {
            phoneNumber = adminToUpdate.phoneNumber;
        }
        adminToUpdate.firstName = firstName;
        adminToUpdate.lastName = lastName;
        adminToUpdate.username = username;
        adminToUpdate.email = email;
        adminToUpdate.phoneNumber = phoneNumber;

        const adminUpdated = await adminToUpdate.save();
        res.json(adminUpdated);
    } catch (err) {
        return res.status(500).json(err.message);
    }
})
router.put("/update-password/:adminId", async(req, res) => {
    try {
        let {
            oldPassword,
            newPassword,
            confirmNewPassword
        } = req.body
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({msg: "Not all fields have been entered"});
        }
        if (newPassword.length < 6) {
            return res.status(400).json({msg: "The password needs to be at least 6 characters long"});
        }
        const adminbakht = await fashion.findById(req.params.adminId);
        const salt = await bcrypt.genSalt();
        const isMatch = await bcrypt.compare(oldPassword, adminbakht.password);
        if (!isMatch) {
            return res.status(400).json({msg: "The password you entered is incorrect"});
        }
        const passwordHash = await bcrypt.hash(newPassword, salt);
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({msg: "New Password and confirm new password are not equal"});
        }
        const isMatchOld = await bcrypt.compare(newPassword, adminbakht.password);
        if (isMatchOld) {
            return res.status(400).json({msg: "New Password you entered is your current password"});
        }
        adminbakht.password = passwordHash;
        const updatedAB = await adminbakht.save();
        res.json(updatedAB);
    } catch (err) {
        res.status(500).json(err.message);
    }
})
router.put('/markasread/:id', async (req, res) => {
    try {
        const msgToRead = await msg.findById(req.params.id);
        msgToRead.status = true;
        const savedMsg = await msgToRead.save();
        res.json(savedMsg);
    } catch (err) {
        res.status(500).json(err.message);
    }
})
router.put('/markasunread/:id', async (req, res) => {
    try {
        const msgToUnread = await msg.findById(req.params.id);
        msgToUnread.status = false;
        const savedMsg = await msgToUnread.save();
        res.json(savedMsg);
    } catch (err) {
        res.status(500).json(err.message);
    }
})
router.put('/messagereplied/:id', async (req, res) => {
    try {
        const msgReplied = await msg.findById(req.params.id);
        msgReplied.replied = true;
        const savedMsg = await msgReplied.save();
        res.json(savedMsg);
    } catch (err) {
        res.status(500).json(err.message);
    }
})
router.delete('/delete-msg/:id', async (req, res) => {
    try {
        const existingMsg = await msg.findByIdAndDelete(req.params.id);
        res.json(existingMsg);
        console.log("Message Deleted");
    } catch (err) {
        res.status(500).json(err.message);
    }
})
router.get('/verify-email', async (req, res) => {
    try {
        verifier.verify(req.query.email, (err, data) => {
            if (err) throw err;
                console.log(data.emailAddress);
                console.log(data.smtpCheck);
                if (data.smtpCheck === "false") {
                    return res.status(400).json({msg: "Email Not Valid!"});
                }
                return res.status(200).json({msg: "Email valid!"});
          });
    } catch (err) {
        res.status(500).json(err.message);
    }
})
router.put('/approve-user/:id', async (req, res) => {
    try {
        const userToApprove = await fashion.findById(req.params.id);
        userToApprove.isVerified = true;
        const userApproved = await userToApprove.save();
        res.json(userApproved);
    } catch (err) {
        res.status(500).json(err.message);
    }
})
router.delete('/reject-user/:id', async (req, res) => {
    try {
        const existingUser = await fashion.findByIdAndDelete(req.params.id);
        res.json(existingUser);
        console.log("User Rejected");
    } catch (err) {
        res.status(500).json(err.message);
    }
})
router.put('/reactivate-user/:id', async (req, res) => {
    try {
        const userToReactivate = await fashion.findById(req.params.id);
        userToReactivate.userState = true;
        const userReactivated = await userToReactivate.save();
        res.json(userReactivated);
    } catch (err) {
        res.status(500).json(err.message);
    }
})

module.exports = router;