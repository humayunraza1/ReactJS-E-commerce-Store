const express = require('express');
const app = express();
const authRoutes = require('../server/api/auth/auth.routes');
const userRoutes = require('../server/user/user.routes')
const adminRoutes = require('../server/admin/admin.routes')
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/users',  userRoutes);
app.use('/admin',  adminRoutes);

const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});