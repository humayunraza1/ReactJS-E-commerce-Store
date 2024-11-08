import React, { useContext, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Store from "./pages/Store";
import UserDashboard from "./pages/UserDashboard";
import { AuthContext } from "./context/AuthProvider";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import Unauthorized from "./pages/Unauthorized";
import PersistLogin from "./components/PersistLogin";
import Order from "./pages/Order";
import Products from "./pages/Products";
import AddNew from "./pages/AddNew";
import AddProduct from "./components/AddProduct";
import { ClerkProvider, SignIn, SignUp } from '@clerk/clerk-react'


const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk publishable key to the .env.local file')
}

const ClerkWithRoutes = ({children}) => {
  const navigate = useNavigate();
  return <ClerkProvider publishableKey={PUBLISHABLE_KEY} navigate={(to)=>navigate(to)}>
      {children}
  </ClerkProvider>
}

function App() {
  const { auth } = useContext(AuthContext);
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login  />} />
        <Route path="unauthorized" element={<Unauthorized />} />
      
        {/* Catch All */}
        <Route path="*" element={<NotFound />} />

        {/* Protected Routes */}
        <Route element={<PersistLogin />}>
          <Route path="/" element={<Store />} />
          <Route path="/products/:productName" element={<Products />} />
          <Route element={<RequireAuth allowedRole={"Admin"} />}>
            <Route path="/edit/:productName" element={<AddProduct />} />
            <Route path="/product/new" element={<AddNew />} />
          </Route>
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="order" element={<Order />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
