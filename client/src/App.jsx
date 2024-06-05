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
function App () {
  const {auth} = useContext(AuthContext)
    return (
    <Routes>
      <Route path="/" element={<Layout/>}>
        {/* Public Routes */}
        <Route path="/" element={<Store />} />
        <Route path="register" element={ <Register />} />
        <Route path="login" element={ <Login />} />
        <Route path="unauthorized" element={ <Unauthorized />} />
      
        {/* Catch All */}
        <Route path="*" element={<NotFound/>}/>
        
        {/* Protected Routes */}
        <Route element={<RequireAuth allowedRole={"Admin"}/>}> 
        <Route path="admin" element={ <AdminDashboard />} />
        </Route>
        <Route element={<RequireAuth allowedRole={"User"}/>}> 
        <Route path="settings" element={ <UserDashboard />} />
        </Route>
      </Route>
    </Routes>
  )
};

export default App;
