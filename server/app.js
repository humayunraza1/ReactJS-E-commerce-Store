const express = require('express');
const app = express();
const authRoutes = require('../server/api/auth/auth.routes');
const userRoutes = require('../server/user/user.routes')
const adminRoutes = require('../server/admin/admin.routes')
const cors = require('cors');
const cookieParser = require('cookie-parser');
// Use CORS with specific origin
app.use(cors({
  origin: 'https://react-js-e-commerce-store-server.vercel.app', // Replace with your client URL
  credentials: true // If you need to include cookies in the requests
}));

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/users',  userRoutes);
app.use('/admin',  adminRoutes);

const port = 3000;
app.get('/',(req,res)=>{
  res.send('Welcome to server')
})

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});