const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authBakht = require("../midlleware/authBakht");
require('dotenv').config();
const crypto = require("crypto");
const mongoose = require("mongoose");
const fashion = require('../models/bakhtartUser');
const forget_passwordFashion = require("../models/forget_passwordFashion");
const productBakhtart = require('../models/product-bakhtart');
const cartBakht = require('../models/cartBakhtart');
const orderBakht = require('../models/orderBakhtart');
const wishProduct = require('../models/wishProd');
const productSeen = require('../models/prodSeen');
const prodRate = require('../models/productRate');
const categoryBakhtart = require('../models/categoryBakhtAdmin');
const msg = require('../models/message');
var randomstring = require("randomstring");
var nodemailer = require('nodemailer');

router.post('/add-new-user/:adminId', async(req, res) => {
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
        const administrator = await fashion.findById(req.params.adminId);
        var transporter = nodemailer.createTransport({
            service: process.env.MAILER_SERVICE,
            auth: {
                user: process.env.MAILER_USER,
                pass: process.env.MAILER_PASS
            },
            host: process.env.MAILER_HOST,
    port: 465,
    secure: false,
        });
        var mailOptions = {
            from: process.env.MAILER_USER,
            to: newFashion.email,
            subject: 'BakhtArt - Welcome To BakhtArt',
            text: 'Hello, welcome to bakhtart',
            html: `
            <h1>Hello there,</h1>
            <p>The administrator ${administrator.firstName} ${administrator.lastName} added you to <a href="https://bakhtart.herokuapp.com" target="_blank">BakhtArt</a>.</p>
            <p>Please login using the credentials below:</p>
            <p>Email: ${newFashion.email}<br/>Password: ${password}</p>
            <p><a href="https://bakhtart.herokuapp.com/login" target="_blank">https://bakhtart.herokuapp.com/login</a></p>
            <b>NB:</b> This is an automated mail.
        `
        };
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent '+ info.response);
            }
        })
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
router.delete('/delete-user-account/:userId/:adminId', async (req, res) => {
    try {
        let query = {userId: req.params.userId};
    
    const existedCart = await cartBakht.find({userId: req.params.userId});
    const existedOrder = await orderBakht.find({userId: req.params.userId});
    const existedOrderProcessing = await orderBakht.count({userId: req.params.userId, stateOrd: 'Processing'});
    const existedOrderDelivering = await orderBakht.count({userId: req.params.userId, stateOrd: 'Delivering'});
    const existProdSeen = await productSeen.find({userId: req.params.userId});
    const existedProdRate = await prodRate.find({userId: req.params.userId});
    const existedWishProd = await wishProduct.find({userId: req.params.userId});
    const bakhtexistUser = await fashion.findById(req.params.userId);
    const bakhtexistAdmin = await fashion.findById(req.params.adminId);
    if (existedOrderProcessing > 0 || existedOrderDelivering > 0) {
        var transporter = nodemailer.createTransport({
            service: process.env.MAILER_SERVICE,
            auth: {
                user: process.env.MAILER_USER,
                pass: process.env.MAILER_PASS
            },
            host: process.env.MAILER_HOST,
    port: 465,
    secure: false,
        });
        var mailOptions = {
            from: process.env.MAILER_USER,
            to: bakhtexistUser.email,
            subject: 'BakhtArt - Account Not Deleted',
            text: 'Hello, account not deleted',
            html: `
            <h1>Hello there,</h1>
            <p>Your account couldn't be deleted.</p>
            <p>The reason is because you have orders that are processing or in delivering.</p>
            <p>//${bakhtexistAdmin.firstName} ${bakhtexistAdmin.lastName} (BakhtArt Administrator)</p>
        `
        };
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent '+ info.response);
            }
        })
        return res.status(400).json({msg: "Account couldn't be deleted! it may contain processing/in delivering products!"});
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
        let userToDelete = await bakhtuser.findByIdAndDelete(req.params.userId);
        res.json(userToDelete);
        let administrator = await adminBakhtart.findById(req.params.adminId);
        var transporter = nodemailer.createTransport({
            service: process.env.MAILER_SERVICE,
            auth: {
                user: process.env.MAILER_USER,
                pass: process.env.MAILER_PASS
            },
            host: process.env.MAILER_HOST,
    port: 465,
    secure: false,
        });
        var mailOptions = {
            from: process.env.MAILER_USER,
            to: userToDelete.email,
            subject: 'BakhtArt - Account Deleted',
            text: 'Hello, account deleted',
            html: `
            <h1>Hello there,</h1>
            <p>Your account has been deleted as you asked.</p>
            <p>We are sorry to see you go.</p>
            <p>You can register again anytime.</p>
            <p><a href="https://bakhtart.herokuapp.com/register" target="_blank">https://bakhtart.herokuapp.com/register</a></p>
            <p>//${administrator.firstName} ${administrator.lastName} (BakhtArt Administrator)</p>
        `
        };
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent '+ info.response);
            }
        })
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
        if (email !== adminToUpdate.email) {
            var transporter = nodemailer.createTransport({
                service: process.env.MAILER_SERVICE,
            auth: {
                user: process.env.MAILER_USER,
                pass: process.env.MAILER_PASS
            },
            host: process.env.MAILER_HOST,
    port: 465,
    secure: false,
        });
        var mailOptions = {
            from: process.env.MAILER_USER,
                to: `${adminToUpdate.email}`,
                subject: 'BakhtArt - Change Email Address',
                text: 'Hello '+adminToUpdate.firstName+' '+adminToUpdate.lastName+', If you requested to change your email address, please confirm below.',
                html: `
            <p>Hello ${adminToUpdate.firstName} ${adminToUpdate.lastName},</p>
            <p>You requested to change your email address, please confirm below.</p>
            <a href="https://bakhtart-backend.herokuapp.com/adminbakht/update-email/${adminToUpdate._id}/${email}" target="_blank">Change my email address</a>
            <br/><br/> Or copy the following URL into your browser <br/> 
            https://bakhtart-backend.herokuapp.com/adminbakht/update-email/${adminToUpdate._id}/${email}
        `
            };
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent '+ info.response);
                }
            })
            
        }
        adminToUpdate.firstName = firstName;
        adminToUpdate.lastName = lastName;
        adminToUpdate.username = username;
        adminToUpdate.phoneNumber = phoneNumber;

        const adminUpdated = await adminToUpdate.save();
        res.json(adminUpdated);
    } catch (err) {
        return res.status(500).json(err.message);
    }
})
router.get("/update-email/:adminId/:emailAddress", async(req, res, next) => {
    try {
        const adminToChangeEmail = await fashion.findById(req.params.adminId);
        adminToChangeEmail.email = req.params.emailAddress;
    await adminToChangeEmail.save();
    var transporter = nodemailer.createTransport({
        service: process.env.MAILER_SERVICE,
    auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASS
    },
    host: process.env.MAILER_HOST,
port: 465,
secure: false,
});
var mailOptions = {
    from: process.env.MAILER_USER,
        to: `${adminToChangeEmail.email}`,
        subject: 'BakhtArt - New Email Address',
        text: 'Hello '+adminToChangeEmail.firstName+' '+adminToChangeEmail.lastName+', your new BakhtArt email address is the same as your email account has',
        html: `
    <p>Hello Administrator "${adminToChangeEmail.firstName} ${adminToChangeEmail.lastName}",</p>
    <p>Your email address has been updated!</p>
    <p>You will future emails from us in this email account.</p>
    <p><br/> BakhtArt</p>
`
    };
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent '+ info.response);
        }
    })
    await req.login(adminToChangeEmail, async (err) => {
        if (err) {
            return next(err);
        }
        const redirectUrl = req.session.redirectTo || 'https://bakhtart.herokuapp.com/admin/edit-account';
        delete req.session.redirectTo;
        return res.redirect(redirectUrl);
    })
    } catch (err) {
        return res.redirect('https://bakhtart.herokuapp.com/admin/edit-account');
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

        var transporter = nodemailer.createTransport({
            service: process.env.MAILER_SERVICE,
            auth: {
                user: process.env.MAILER_USER,
                pass: process.env.MAILER_PASS
            },
            host: process.env.MAILER_HOST,
    port: 465,
    secure: false,
        });
        var mailOptions = {
            from: process.env.MAILER_USER,
            to: `${adminbakht.email}`,
            subject: 'BakhtArt - Password Updated',
            text: 'Hello. Your password has been updated!',
            html: `
            <p>Hello Administrator ${adminbakht.firstName} ${adminbakht.lastName},</p>
            <p>Your password has been updated! 
            <br/> BakhtArt
        `
        };
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent '+ info.response);
            }
        })
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

module.exports = router;