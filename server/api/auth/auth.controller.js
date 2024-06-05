const {User} = require('../../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

// Google Login 

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/api/auth/google/callback',
  passReqToCallback: true
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        // Add any default values for required fields
      });
      await user.save();
    }
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

const googleAuthCallback = passport.authenticate('google', { failureRedirect: '/' });

const googleAuthHandler = (req, res) => {
  const token = generateJWT(req.user.id);
  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 3600000 // 1 hour
  });
  res.redirect('/profile'); // Redirect to profile or home page after successful login
};

// End Of Google Login


const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
    if (!cookies?.refreshToken) {
      return res.sendStatus(401)
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
                    decoded.exp = Math.floor(Date.now() / 1000) + 30; // 30s
                    const newToken = jwt.sign(decoded, process.env.JWT_SECRET);
                    res.json({newToken})
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
      sameSite: 'None', // Required for cross-site cookies
      secure: false, // Set to true if using HTTPS
      maxAge: 604800000 // expires in 7 days
    });
    return res.status(201).send({message:"Loggedin Successfuly", user:userInfo, token:token});
  } catch (error) {
    return res.status(500).send('Error logging in user!');
  }
};

const generateJWT = (user) => {
  console.log("user : ",user)
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '30s' });
};

const generateRefreshToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });
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
    secure: false, // Set to true if using HTTPS
    maxAge: 604800000 // expires in 7 days
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
  googleAuth,
  googleAuthCallback,
  googleAuthHandler,
  handleRefreshToken,
  handleLogout
};