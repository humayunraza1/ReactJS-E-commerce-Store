const {User} = require('../../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

const refreshTokens = [];

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email already registered!');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).send('User registered successfully!');
  } catch (error) {
    console.log(error)
    res.status(500).send('Error registering user!');
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid email or password!');
    }
    const token = generateJWT(user.userID);
    const refreshToken = generateRefreshToken(user.userID);
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 3600000 // expires in 1 hour
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 604800000 // expires in 7 days
    });
    return res.status(201).send({message:"Loggedin Successfuly", token:token,refreshToken:refreshToken});
  } catch (error) {
    res.status(500).send('Error logging in user!');
  }
};

const generateJWT = (userID) => {
  console.log("user id: ",userID)
  return jwt.sign({userID: userID }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const generateRefreshToken = (userID) => {
  return jwt.sign({userID: userID }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const sendPasswordResetEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found!');
    }
    const token = crypto.randomBytes(20).toString('hex');
    const expires = Date.now() + 300000; // 5 minutes

    // Store the token and expiration time in the user database
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    const transporter = nodemailer.createTransport({
      host: 'Gmail',
      auth: {
        user: 'myprojectwebsite10@gmail.com',
        pass: 'SUperstar3'
      }
    });

    const mailOptions = {
      from: 'myprojectwebsite10@gmail.com',
      to: email,
      subject: '[Alert] Password Reset Link - Expires in 5 minutes',
      text: `Please click on the following link to reset your password: http://localhost:3000/api/auth/reset-password/${token} `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Email sent: ' + info.response);
    });
    res.status(200).send({link:`http://localhost:3000/api/auth/reset-password?token=${token}`,msg:'Password reset email sent!'});
  } catch (error) {
    console.log(error)
    res.status(500).send('Error sending password reset email!');
  }
};
const resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    console.log('link token: ', token)

    const user = await User.findOne({ resetPasswordToken: token });
    if(!user){
      return res.status(404).send('Invalid Token');
    }
    const expires = user.resetPasswordExpires;
    const fiveMinutes = 300000;
    if (Date.now() - expires > fiveMinutes) {
      return res.status(400).send('Link expired!');
    }
    console.log(`User email: ${user.email}`); // Output the user's email
    
    res.cookie('user', user.email, {
      httpOnly: true,
      maxAge: 30000 // expires in 1 hour
    });

    res.status(200).send(`Email: ${user.email}`);
  } catch (error) {
    console.log(error)
    res.status(500).send('Error resetting password!');
  }
};

const confirmPassword = async (req, res) => {
  try {
    const { newPassword, confirmNewPassword } = req.body;
    if (newPassword !== confirmNewPassword) {
      return res.status(400).send('Passwords do not match');
    }
    const user = await User.findOne({ resetPasswordToken: req.query.token });
    if (!user) {
      return res.status(404).send('Invalid token');
    }
    const tokenExpires = user.resetPasswordExpires;
    const fiveMinutes = 300000; // 5 minutes in milliseconds
    if (Date.now() - tokenExpires > fiveMinutes) {
      return res.status(400).send('Token has expired');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    res.status(200).send('Password reset successfully!');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error resetting password');
  }
};
module.exports = { 
  registerUser, 
  loginUser,
  generateJWT, 
  generateRefreshToken,
  sendPasswordResetEmail,
  resetPassword,
  confirmPassword
};