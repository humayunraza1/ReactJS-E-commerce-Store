import React from "react"
import { Outlet } from "react-router-dom";
import { Toaster } from "./ui/sonner";
import { Button } from "antd";
import useAuth from "src/hooks/useAuth";

function Layout () {
  const {auth} = useAuth();
  return (
    <div >
      <Outlet/>
      <Toaster richColors position="top-center"/>
      <Button onClick={()=>{console.log(auth.token)}}>Output</Button>
    </div>
  )
};

export default Layout;
