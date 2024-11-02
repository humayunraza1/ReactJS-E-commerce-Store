const express = require('express');
const app = express();
const authRoutes = require('../server/api/auth/auth.routes');
const userRoutes = require('../server/user/user.routes')
const adminRoutes = require('../server/admin/admin.routes')
const cors = require('cors');
const cookieParser = require('cookie-parser');
// Use CORS with specific origin
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = ['https://react-js-e-commerce-store-client.vercel.app'];
const corsOptions = {
  origin: allowedOrigins, // Replace with the domain you want to allow
  credentials: true, // Allow credentials to be included in the request
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow these HTTP methods
  allowedHeaders: 'Content-Type,Authorization', // Allow these headers
};
app.use(
  cors(corsOptions)
);

// Handle preflight `OPTIONS` request for all routes
app.options('*', cors(corsOptions));

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