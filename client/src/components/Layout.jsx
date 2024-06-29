import React from "react"
import { Outlet } from "react-router-dom";
import { Toaster } from "./ui/sonner";

function Layout () {
  return (
    <div >
      <Outlet/>
      <Toaster richColors position="top-center"/>
    </div>
  )
};

export default Layout;
