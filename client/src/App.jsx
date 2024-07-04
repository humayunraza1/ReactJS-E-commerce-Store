import React, { useContext, useEffect, useState } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Register from "./pages/Register"
import Login from "./pages/Login"
import Store from "./pages/Store"
import UserDashboard from "./pages/UserDashboard"
import {AuthContext} from "./context/AuthProvider";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import Unauthorized from "./pages/Unauthorized";
import AdminDashboard from "./pages/AdminDashboard";
import PersistLogin from "./components/PersistLogin";
import Order from "./pages/Order";
function App () {
  const {auth} = useContext(AuthContext)
    return (
    <Routes>
      <Route path="/" element={<Layout/>}>
        {/* Public Routes */}
        <Route path="register" element={ <Register />} />
        <Route path="login" element={ <Login />} />
        <Route path="unauthorized" element={ <Unauthorized />} />
      
        {/* Catch All */}
        <Route path="*" element={<NotFound/>}/>
        
        {/* Protected Routes */}
        <Route element={<PersistLogin />}>
        <Route path="/" element={<Store />} />
        <Route path="/products/:productName" element={<Store />} />
        <Route element={<RequireAuth allowedRole={"Admin"}/>}> 
        <Route path="admin" element={ <AdminDashboard />} />
        </Route>
        <Route element={<RequireAuth allowedRole={"User"}/>}> 
        <Route path="dashboard" element={ <UserDashboard />} />
        <Route path="order" element={ <Order />} />
        </Route>
        </Route>
      </Route>
    </Routes>
  )
};

export default App;
