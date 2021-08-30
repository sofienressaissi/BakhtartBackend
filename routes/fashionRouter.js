const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authBakht = require("../midlleware/authBakht");
require('dotenv').config();
const crypto = require("crypto");
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

router.put('/fashion-profile/:id', async(req, res) => {
    try {
        let {
            imageProfile
        } = req.body;
        const existedFashion = await fashion.findById(req.params.id);
        existedFashion.imageProfile = imageProfile;
        const savedFashion = await existedFashion.save();
        res.json(savedFashion);
    } catch (err) {
        res.status(500).json(err.message);
    }
})

router.post("/send-message", async (req, res) => {
    try {
        let {
            firstName,
            lastName,
            email,
            subject,
            content
        } = req.body
        if (!firstName || !lastName || !email || !subject || !content) {
            return res.status(400).json({msg: "Not all fields have been entered"});
        }
        const user = await fashion.findOne({email: email});
        if (!user || user.roleBakht !== 'user') {
            return res.status(400).json({msg: "Message can't be sent"});
        }
        const newMsg = new msg({
            firstName,
            lastName,
            email,
            subject,
            content,
            status: false
        })
        const savedMsg = await newMsg.save();
        res.json(savedMsg);
    } catch (err) {
        res.status(500).json(err.message);
    }
})

router.post("/register", async (req, res) => {
    res.setHeader("Content-Type", "text/html");
    try {
        let {
            firstName,
            lastName,
            username,
            email,
            password,
            passwordCheck,
            phoneNumber
        } = req.body
        if (!firstName || !lastName || !phoneNumber || !email || !password || !passwordCheck) {
            return res.status(400).json({msg: "Not all fields have been entered"});
        }
        if (password.length < 6) {
            return res.status(400).json({msg: "The password needs to be at least 6 characters long"});
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
        if (password !== passwordCheck) {
            return res.status(400).json({msg: "Password and confirm password are not equal"});
        }
        const existingFashion = await fashion.findOne({
            email: email
        })
        const existingFashionPhone = await fashion.findOne({
            phoneNumber: phoneNumber
        })
        const existingAdminAcc = await fashion.findOne({
            email: email
        })
        if (email === 'bakhtartfashion@gmail.com') {
            return res.status(400).json({msg: "You can't register with email"});
        }
        if (existingAdminAcc) {
            return res.status(400).json({msg: "An account with this email already exists"});
        }
        if (existingFashionPhone) {
            return res.status(400).json({msg: "An account with this phone number already exists"});
        }
        if (existingFashion) {
            return res.status(400).json({msg: "An account with this email already exists"});
        }
        if (!username) {
            username = email
        }
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
            emailToken: crypto.randomBytes(64).toString('hex'),
            isVerified: false,
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
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'bakhtartfashion@gmail.com',
                pass: 'BakhtartFashion123!'
            },
            host: 'smtp.gmail.com',
    port: 465,
    secure: false,
        });
        var mailOptions = {
            from: 'bakhtartfashion@gmail.com',
            to: newFashion.email,
            subject: 'BakhtArt - Verify your email',
            text: 'Hello, thanks for registering to BakhtArt. Please copy the address below to verify your account. https://bakhtart-backend.herokuapp.com/fashion/verify-email?token='+newFashion.emailToken,
            html: `
            <h1>Hello ${newFashion.username},</h1>
            <p>Thank you for registering to our website.</p>
            <p>Please click below to verify your account.</p>
            <a href="https://bakhtart-backend.herokuapp.com/fashion/verify-email?token=${newFashion.emailToken}">Verify your account</a>
            <br/> Or copy the following URL into your browser <br/> 
            https://bakhtart-backend.herokuapp.com/fashion/verify-email?token=${newFashion.emailToken}
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
});

router.put('/change-password/:userId', async (req, res) => {
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
        const fashionn = await fashion.findById(req.params.userId);
        const salt = await bcrypt.genSalt();
        const isMatch = await bcrypt.compare(oldPassword, fashionn.password);
        if (!isMatch) {
            return res.status(400).json({msg: "The password you entered is incorrect"});
        }
        const passwordHash = await bcrypt.hash(newPassword, salt);
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({msg: "New Password and confirm new password are not equal"});
        }
        const isMatchOld = await bcrypt.compare(newPassword, fashionn.password);
        if (isMatchOld) {
            return res.status(400).json({msg: "New Password you entered is your current password"});
        }

        fashionn.password = passwordHash;
        const updatedFashion = await fashionn.save();
        res.json(updatedFashion);

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
            to: `${fashionn.email}`,
            subject: 'BakhtArt - Password Updated',
            text: 'Hello. Your password has been updated! Please let us know if it is a suspicious activity!',
            html: `
            <p>Hello ${fashionn.firstName} ${fashionn.lastName},</p>
            <p>Your password has been updated! 
            <span style="color: red;">contact us if it is a suspicious activity!</span></p>
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

router.put('/forget-password', async (req, res) => {
    try {
        let {
            email
        } = req.body;
        if (!email) {
            return res.status(400).json({msg: "The field is empty"});
        }
        const fashionn = await fashion.findOne({ email: email });
        if (!fashionn) {
            return res.status(400).json({msg: "No account with this email exists"});
        }

        const newFPFashion = new forget_passwordFashion({
            email
        })
        const savedFPFashion = await newFPFashion.save();
        res.json(savedFPFashion);

        let newPass = randomstring.generate(8);
        const salt = await bcrypt.genSalt();
        const newPasswordHash = await bcrypt.hash(newPass, salt);
        fashionn.password = newPasswordHash;
        await fashionn.save();

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
            to: fashionn.email,
            subject: 'BakhtArt - Forget Password',
            text: 'Hello '+fashionn.username+', Did you forget your password ? Click here to reset it !',
            html: `
                <h1>Hello ${fashionn.username},</h1>
                <p>Did you forget your password ?</p>
                <p>We have generated a new one for you: ${newPass}</p>
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

router.get("/verify-email", async (req, res, next) => {
    try {
        const fashionn = await fashion.findOne({ emailToken: req.query.token });
        if (!fashionn) {
            return res.redirect('https://bakhtart.herokuapp.com/bakhtArt/login');
        }
        fashionn.emailToken = null;
        fashionn.isVerified = true;
        await fashionn.save();
        await req.login(fashionn, async (err) => {
            if (err) {
                return next(err);
            }
            const redirectUrl = req.session.redirectTo || 'https://bakhtart.herokuapp.com/bakhtArt/login';
            delete req.session.redirectTo;
            return res.redirect(redirectUrl);
        })
    } catch (error) {
        console.log(error);
        return res.redirect('https://bakhtart.herokuapp.com/bakhtArt/login');
    }
})

router.post("/login", async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body
        if (!email || !password) {
            return res.status(400).json({msg: "Not all fields have been entered"});
        }
        const fashionn = await fashion.findOne({email: email});
        if (!fashionn) {
            return res.status(400).json({msg: "No account with this email has been registered"});
        }
        if (fashionn.isVerified === false) {
            return res.status(400).json({msg: "Please check your email to verify your account to login to your account."});
        }
        if (fashionn.userState === false) {
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
                to: fashionn.email,
                subject: 'BakhtArt - Account Reactivation',
                text: 'Hello '+fashionn.username+', your account is deactivated. Click the link below to reactivate it.',
                html: `
            <h2>Hello ${fashionn.username},</h2>
            <p>Your account is deactivated. That is the reason of not being able to log in.<br/>Please click below to reactivate it.</p>
            <a href="https://bakhtart-backend.herokuapp.com/fashion/reactivate-account?email=${fashionn.email}">Reactivate your account</a>
            <br/><br/> Or copy the following URL into your browser <br/> 
            https://bakhtart-backend.herokuapp.com/fashion/reactivate-account?email=${fashionn.email}
        `
            };
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent '+ info.response);
                }
            })
            return res.status(400).json({msg: "You deactivated your account. Check your email to reactivate it."});
        }
        const isMatch = await bcrypt.compare(password, fashionn.password);
        if (!isMatch) {
            return res.status(400).json({msg: "Invalid credentials"});
        }
        const token = jwt.sign({
                id: fashionn._id
            },
            process.env.JWT_BAKHT);
        res.json({
            token,
            userr: {
                id: fashionn._id,
                firstName: fashionn.firstName,
                lastName: fashionn.lastName,
                username: fashionn.username,
                email: fashionn.email,
                phoneNumber: fashionn.phoneNumber,
                roleBakht: fashionn.roleBakht
            }
        })
    } catch (err) {
        res.status(500).json(err.message);
    }
})

router.get("/reactivate-account", async (req, res, next) => {
    try {
        const fashionnReactivation = await fashion.findOne({ email: req.query.email });
        if (!fashionnReactivation) {
            return res.redirect('https://bakhtart.herokuapp.com/bakhtArt/login');
        }
        fashionnReactivation.userState = true;
        await fashionnReactivation.save();
        await req.login(fashionnReactivation, async (err) => {
            if (err) {
                return next(err);
            }
            const redirectUrl = req.session.redirectTo || 'https://bakhtart.herokuapp.com/bakhtArt/login';
            delete req.session.redirectTo;
            return res.redirect(redirectUrl);
        })
    } catch (error) {
        console.log(error);
        return res.redirect('https://bakhtart.herokuapp.com/bakhtArt/login');
    }
})

router.get("/update-email/:userId/:email", async(req, res, next) => {
    try {
        const userToChangeEmail = await fashion.findById(req.params.userId);
    userToChangeEmail.email = req.params.email;
    await userToChangeEmail.save();
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
        to: `${userToChangeEmail.email}`,
        subject: 'BakhtArt - New Email Address',
        text: 'Hello '+userToChangeEmail.firstName+' '+userToChangeEmail.lastName+', your new BakhtArt email address is the same as your email account has',
        html: `
    <p>Hello ${userToChangeEmail.firstName} ${userToChangeEmail.lastName},</p>
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
    await req.login(userToChangeEmail, async (err) => {
        if (err) {
            return next(err);
        }
        const redirectUrl = req.session.redirectTo || 'https://bakhtart.herokuapp.com/bakhtArt/account';
        delete req.session.redirectTo;
        return res.redirect(redirectUrl);
    })
    } catch (err) {
        return res.redirect('https://bakhtart.herokuapp.com/bakhtArt/account');
    }
})

router.put("/update-fashion/:id", async(req, res) => {
    try {
        let {
            firstName,
            lastName,
            username,
            email,
            phoneNumber,
            gender,
            region,
            ville,
            firstAddress,
            secondAddress
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
        const fashionnToUpdate = await fashion.findById(req.params.id);

        if (!firstName) {
            firstName = fashionnToUpdate.firstName;
        }
        if (!lastName) {
            lastName = fashionnToUpdate.lastName;
        }
        if (!username) {
            username = fashionnToUpdate.username;
        }
        if (!email) {
            email = fashionnToUpdate.email;
        }
        if (!phoneNumber) {
            phoneNumber = fashionnToUpdate.phoneNumber;
        }
        if (!gender) {
            gender = fashionnToUpdate.gender;
        }
        if (!firstAddress) {
            firstAddress = fashionnToUpdate.firstAddress;
        }
        if (!secondAddress) {
            secondAddress = fashionnToUpdate.secondAddress;
        }
        if (!region) {
            region = fashionnToUpdate.region;
        }
        if (!ville) {
            ville = fashionnToUpdate.ville;
        }
        if (email !== fashionnToUpdate.email) {
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
                to: `${fashionnToUpdate.email}`,
                subject: 'BakhtArt - Change Email Address',
                text: 'Hello '+fashionnToUpdate.firstName+' '+fashionnToUpdate.lastName+', If you requested to change your email address, please confirm below.',
                html: `
            <p>Hello ${fashionnToUpdate.firstName} ${fashionnToUpdate.lastName},</p>
            <p>If you requested to change your email address, please confirm below.</p>
            <p>Otherwise, <span style="color: red;">
            let us know if it is a suspicious activity!</span></p>
            <a href="https://bakhtart-backend.herokuapp.com/fashion/update-email/${fashionnToUpdate._id}/${email}" target="_blank">Change my email address</a>
            <br/><br/> Or copy the following URL into your browser <br/> 
            https://bakhtart-backend.herokuapp.com/fashion/update-email/${fashionnToUpdate._id}/${email}
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
        fashionnToUpdate.firstName = firstName;
        fashionnToUpdate.lastName = lastName;
        fashionnToUpdate.username = username;
        fashionnToUpdate.phoneNumber = phoneNumber;
        fashionnToUpdate.gender = gender;
        fashionnToUpdate.region = region;
        fashionnToUpdate.ville = ville;
        fashionnToUpdate.firstAddress = firstAddress;
        fashionnToUpdate.secondAddress = secondAddress;

        const fashionUpdated = await fashionnToUpdate.save();
        res.json(fashionUpdated);

    } catch (error) {
        console.log(error);
    }
})

router.put("/deactivate/:id", authBakht, async(req, res) => {
    try {
        const fashionnToUpdate = await fashion.findByIdAndUpdate(req.params.id);
        if (!fashionnToUpdate) {
            return res.redirect('https://bakhtart.herokuapp.com/bakhtArt/login');
        }
        fashionnToUpdate.userState = false;
        const fashionnUpdated = await fashionnToUpdate.save();
        res.json(fashionnUpdated);

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
            to: fashionnToUpdate.email,
            subject: 'BakhtArt - Account Deactivation',
            text: 'Hello '+fashionnToUpdate.username+', your account has been deactivated.',
            html: `
            <h2>Hello ${fashionnToUpdate.username},</h2>
            <h2>Your account has been deactivated</h2>
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
        return res.status(500).json(err.message);
    }
})

router.delete("/delete/:id", authBakht, async(req, res) => {
    try {
        const deletedFashion = await fashion.findByIdAndDelete(req.params.id);
        res.json(deletedFashion);

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
            to: deletedFashion.email,
            subject: 'BakhtArt - Account Deletion',
            text: 'Hello '+deletedFashion.username+', your account has been deleted. We are sorry to see you go.',
            html: `
            <h2>Hello ${deletedFashion.username},</h2>
            <h2>Your account has been deleted.</h2>
            <h2>We are sorry to see you go.</h2>
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
        return res.status(500).json(err.message);
    }
})

router.post("/tokenIsValid", async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) {
            return res.json(false);
        }
        const verified = jwt.verify(token, process.env.JWT_BAKHT);
        if (!verified) {
            return res.json(false);
        }
        const userr = await fashion.findById(verified.id);
        if (!userr) {
            return res.json(false);
        }
        return res.json(true);
    } catch (err) {
        res.status(500).json(err.message);
    }
})

router.post('/add-product-rate/:userId', async(req, res) => {
    try {
        let {
            rateValue,
            productId
        } = req.body
        const newProdRate = new prodRate({
            rateValue,
            productId,
            userId: req.params.userId
        })
        const savedProdRate = await newProdRate.save();
        res.json(savedProdRate);
    } catch (err) {
        res.status(500).json(err.message);
    }
})
router.post('/add-prod-seen/:userId', async (req, res) => {
    try {
        let {
            productId
        } = req.body
        const existedSeenProd = await productSeen.findOne({
            productId: productId,
            userId: req.params.userId
        })
        if (existedSeenProd) {
            const seenProdToDelete = await productSeen.findOneAndDelete({
                productId: productId,
                userId: req.params.userId
            });
            res.json(seenProdToDelete);
            const newProdSeen = new productSeen({
                productId: productId,
                userId: req.params.userId,
                dateSeen: Date.now()
            });
            const savedProdSeen = await newProdSeen.save();
            res.json(savedProdSeen);
        } else {
            const newProdSeen = new productSeen({
                productId: productId,
                userId: req.params.userId,
                dateSeen: Date.now()
            });
            const savedProdSeen = await newProdSeen.save();
            res.json(savedProdSeen);
        }
    } catch (err) {
        res.status(500).json(err.message);
    }
})
router.post('/add-wishlist/:productId/:userId', async (req, res) => {
    try {
        const newWishProd = new wishProduct({
            productId: req.params.productId,
            userId: req.params.userId
        });
        const savedWishProd = await newWishProd.save();
        res.json(savedWishProd);
    } catch (err) {
        res.status(500).json(err.message);
    }
})
router.post('/add-to-cart/:userId', async(req, res) => {
    try {
        let {
            productId
        } = req.body
        const ecByUserId = await cartBakht.findOne({
            userId: req.params.userId
        })
        const existingCartUser = await cartBakht.findOne({
            productId: productId,
            userId: req.params.userId
        });
        if (existingCartUser) {
            return res.status(400).json({msg: "This product is already added to cart!"});
        }
        if (ecByUserId) {
            const newCartBakht = new cartBakht({
                productId,
                userId: req.params.userId,
                quantityMin: 1,
                orderNumber: ecByUserId.orderNumber
            });
            const savedCartBakht = await newCartBakht.save();
            res.json(savedCartBakht);
        } else {
            const newCartBakht = new cartBakht({
                productId,
                userId: req.params.userId,
                quantityMin: 1,
                orderNumber: Math.floor(10000000 + Math.random() * 90000000)
            });
            const savedCartBakht = await newCartBakht.save();
            res.json(savedCartBakht);
        }
    } catch (err) {
        res.status(500).json(err.message);
    }
})
router.get('/countprodcart',(req,res)=>{
    cartBakht.find({}, function (err, result) {
        if (err) {
            res.send(err)
        } else {
            res.json(result)
        }
    });
});
router.get('/countprodrate',(req,res)=>{
    prodRate.find({}, function (err, result) {
        if (err) {
            res.send(err)
        } else {
            res.json(result)
        }
    });
});
router.get('/all-orders',(req,res)=>{
    orderBakht.find({}, function (err, result) {
        if (err) {
            res.send(err)
        } else {
            res.json(result)
        }
    });
});
router.get('/all-prods-seen',(req,res)=>{
    productSeen.find({}, function (err, result_prod_seen) {
        if (err) {
            res.send(err)
        } else {
            res.json(result_prod_seen)
        }
    });
});
router.get('/all-wish-prods',(req,res)=>{
    wishProduct.find({}, function (err, resultWish) {
        if (err) {
            res.send(err)
        } else {
            res.json(resultWish)
        }
    });
});
router.delete('/delete-prod-from-cart/:productId/:userId', async (req, res) => {
    try {
        const existingCartToDelete = await cartBakht.findOneAndDelete({
            productId: req.params.productId,
            userId: req.params.userId
        });
        res.json(existingCartToDelete);
        console.log("Cart Deleted");
    } catch (err) {
        res.status(500).json(err.message);
    }
})
router.delete('/delete-prod-wish/:productId/:userId', async(req, res) => {
    try {
        const existingProdWishToDelete = await wishProduct.findOneAndDelete({
            productId: req.params.productId,
            userId: req.params.userId
        });
        res.json(existingProdWishToDelete);
        console.log("Product Deleted From Wishlist");
    } catch (err) {
        res.status(500).json(err.message);
    }
})
router.delete('/delete-order/:productId/:userId', async (req, res) => {
    try {
        const existingOrderToDelete = await orderBakht.findOneAndDelete({
            productId: req.params.productId,
            userId: req.params.userId
        });
        res.json(existingOrderToDelete);
        console.log("Order Deleted");
        const existingProduct = await productBakhtart.findById(req.params.productId);
        existingProduct.productQuantity = existingProduct.productQuantity + 1;
        const updatedEProduct = await existingProduct.save();
        res.json(updatedEProduct);
    } catch (err) {
        res.status(500).json(err.message);
    }
})
router.post('/place-order/:productId/:userId', async (req, res) => {
    try {
        let {
            orderNumber
        } = req.body
        const existingCart = await cartBakht.findOne({productId: req.params.productId});
        const newOrderBakht = new orderBakht({
            productId: req.params.productId,
            userId: req.params.userId,
            quantityOrd: existingCart.quantityMin,
            orderNumber: orderNumber,
            stateOrd: "Processing",
            dateOrd: Date.now()
        });
        await newOrderBakht.save();
        const existingProd = await productBakhtart.findById(req.params.productId);
        existingProd.productQuantity = existingProd.productQuantity - newOrderBakht.quantityOrd;
        await existingProd.save();
        const userToMail = await fashionBakht.findById(req.params.userId);
        res.json(userToMail.email);
        
    } catch (err) {
        console.log(userToMail.email+ " yodhher wéllé");
    }
})
router.get('/send-email-order/:userId/:orderNumber', async (req, res) => {
try {
    const userToMail = await fashionBakht.findById(req.params.userId);
    res.json(userToMail.email);
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
        to: `${userToMail.email}`,
        subject: `BakhtArt - Order #${req.params.orderNumber} Confirmation`,
        text: 'Hello '+userToMail.firstName+', thank you for shopping with us.',
        html: `
    <h2>Hello ${userToMail.firstName} ${userToMail.lastName},</h2>
    <p>Your Order #${req.params.orderNumber} has been submitted! Thank you for shopping with us!</p>
    <a href="https://bakhtart.herokuapp.com/bakhtArt/my-orders">See My Order</a>
`
    };
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(userToMail.email+ " yodhher wéllé");
        } else {
            res.json(userToMail.email);
        }
    })
} catch (err) {
    console.log(userToMail.email+ " yodhher wéllé");
}
})
router.put('/incr-quantity/:userId/:productId', async (req, res) => {
    try {
        const existingCartUser = await cartBakht.findOne({
            productId: req.params.productId,
            userId: req.params.userId
        });
        const existingProd = await productBakhtart.findById(req.params.productId);
        if (existingProd.productQuantity < existingCartUser.quantityMin + 1) {
            return res.status(400).json({msg: "You have reached the quantity limit!"});
        }
        existingCartUser.quantityMin = existingCartUser.quantityMin + 1;
        const savedCartBakht = await existingCartUser.save();
            res.json(savedCartBakht);
    } catch (err) {
        res.status(500).json(err.message);
    }
})
router.put('/decr-quantity/:userId/:productId', async (req, res) => {
    try {
        const existingCartUser = await cartBakht.findOne({
            productId: req.params.productId,
            userId: req.params.userId
        });
        if (existingCartUser.quantityMin - 1 === 0) {
            return res.status(400).json({msg: "The product quantity can't be null!"});
        }
        existingCartUser.quantityMin = existingCartUser.quantityMin - 1;
        const savedCartBakht = await existingCartUser.save();
            res.json(savedCartBakht);
    } catch (err) {
        res.status(500).json(err.message);
    }
})
router.get('/allBakhtCatsAdmin', async(req, res) => {
    categoryBakhtart.find(null, function (err, list_bakhtadmincats) {
        if (err) {
            throw err;
        }
        res.send(list_bakhtadmincats);
    })
})
router.get('/allMsgsUnread', async (req, res) => {
    msg.count({status: false}, function (err, list_unreadmsgs) {
        if (err) {
            throw err;
        }
        res.send(list_unreadmsgs);
    })
})

router.get("/", authBakht, async (req, res) => {
    const userr = await fashion.findById(req.userr);
    res.json({
        id: userr._id,
        firstName: userr.firstName,
        lastName: userr.lastName,
        username: userr.username,
        email: userr.email,
        phoneNumber: userr.phoneNumber,
        imageProfile: userr.imageProfile,
        firstAddress: userr.firstAddress,
        secondAddress: userr.secondAddress,
        region: userr.region,
        ville: userr.ville,
        gender: userr.gender,
        dateCreation: userr.dateCreation,
        userState: userr.userState,
        roleBakht: userr.roleBakht
    });
})

module.exports = router;
