const {User} = require('../../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();



async function googleLogin(req,res){
  const {id,email,name} = req.body
  console.log('Google:' , {id:id, email:email, name:name})
  let user = await User.findOne({email});
  console.log(user)
  if(!user){
    user = new User({googleId:id,email,name})
    await user.save();
    user = await User.findOne({googleId:id})
 } 
 if(user && user.googleId !== id) {
      return res.status(403).send("Account already registered with that email.")
  } 
const userInfo = {userID:user.userID, role:user.role}
const token = generateJWT(userInfo)
const refreshToken = generateRefreshToken(userInfo)
user.refreshToken = refreshToken;
await user.save();
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'None', // Required for cross-site cookies
  maxAge: 1000 * 60 * 60 * 24 * 3 // expires in 3 days
});
return res.status(200).send({token:token, user:userInfo, msg:"Logged In Successfuly"})
}

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
    if (!cookies?.refreshToken) {
      return res.status(401).send("No refresh token cookie found")
    }
    console.log(cookies.refreshToken)
    const refreshToken = cookies.refreshToken;
    const user = await User.findOne({refreshToken})
    if(!user) return res.sendStatus(403) // Frobidden

    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
                    if (err || user.userID !== decoded.userID) {
                      return res.sendStatus(403);
                    }
                    // Update the user object with a new expiration time
                    decoded.exp = Math.floor(Date.now() / 1000) + 60 * 60 * 1; // 1h
                    const newToken = jwt.sign(decoded, process.env.JWT_SECRET);
                    res.json({user:{userID:user.userID,role:user.role}, newToken})
                  });
};


const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email already registered!');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, googleId:"null" });
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
    console.log(email,password)
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid email or password!');
    }
    const userInfo = {userID: user.userID, role: user.role}
    const token = generateJWT(userInfo);
    const refreshToken = generateRefreshToken(userInfo);
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None', // Required for cross-site cookies
      maxAge: 1000 * 60 * 60 * 24 * 3 // expires in 3 days
    });
    return res.status(201).send({message:"Loggedin Successfuly", user:userInfo, token:token});
  } catch (error) {
    return res.status(500).send('Error logging in user!');
  }
};

const generateJWT = (user) => {
  console.log("user : ",user)
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const generateRefreshToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '3d' });
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

async function handleLogout(req,res){
  const cookies = req.cookies;
  if(!cookies?.refreshToken) return res.sendStatus(204);

  const refreshToken = cookies.refreshToken;
  
  const user = await User.findOne({refreshToken})
  if(!user){
    res.clearCookie('refreshToken',{
      httpOnly: true,
      sameSite: 'None', // Required for cross-site cookies
      secure: false, // Set to true if using HTTPS
      maxAge: 604800000 // expires in 7 days
    });
    return res.sendStatus(204);
  }

  user.refreshToken = null;
  await user.save();
  res.clearCookie('refreshToken',{
    httpOnly: true,
    sameSite: 'None', // Required for cross-site cookies
    secure: true, // Set to true if using HTTPS
    maxAge: 1000 * 60 * 60 * 24 // expires in 1 day
  });
  return res.sendStatus(204);
}

module.exports = { 
  registerUser, 
  loginUser,
  generateJWT, 
  generateRefreshToken,
  sendPasswordResetEmail,
  resetPassword,
  confirmPassword,
  handleRefreshToken,
  handleLogout,
  googleLogin
};