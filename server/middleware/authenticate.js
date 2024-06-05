const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to verify JWT token

function verifyRoles(role){
  return (req,res,next)=>{
      if(!res?.role) return res.sendStatus(401);

      const allowedrole = role
      console.log(allowedrole);
      console.log(req.role);
      const result = req.role == allowedrole
      if(!result) return res.sendStatus(401);
      next();
    }
}

function authenticate(req, res, next) {
  const token = req.headers.authorization || res.headers.Authorization;
  if (token == null) {
    return res.status(401).json({ error: 'Token is required' });
  }
  
  // Verify the JWT token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
        return res.status(403).json({ error: 'Invalid token' });
    } else {
      req.user = user;
      next();
    }
  });
}

// function authenticate(req, res, next) {
//   const token = req.headers.authorization || res.headers.Authorization;
//   if (token == null) {
//     return res.status(401).json({ error: 'Token is required' });
//   }
  
//   // Verify the JWT token
//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) {
//       // Check if the error is due to token expiration
//       if (err.name === 'TokenExpiredError') {
//         // Use refresh token to generate new token
//         const refreshToken = req.cookies.refreshToken;
//         console.log(refreshToken)
//         console.log('Token expired, getting new token.')
//         if (refreshToken) {
//             jwt.verify(refreshToken, process.env.JWT_SECRET, (err, user) => {
//               if (err) {
//                 return res.status(403).json({ error: 'Invalid refresh token, please re-log.' });
//               }
//               // Update the user object with a new expiration time
//               user.exp = Math.floor(Date.now() / 1000) + 120 * 60; // 1 hour
//               const newToken = jwt.sign(user, process.env.JWT_SECRET);
//               res.json({newToken})
//               console.log("new token acquired: ", newToken)
//               req.user = user;
//               res.set('Authorization', `${newToken}`);
//               next();
//             });
//           } else {
//             return res.status(401).json({ error: 'Refresh token is required' });
//           }
//       } else {
//         return res.status(403).json({ error: 'Invalid token' });
//       }
//     } else {
//       req.user = user;
//       next();
//     }
//   });
// }

module.exports = {authenticate,verifyRoles};