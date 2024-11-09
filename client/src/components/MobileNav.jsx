import { HomeOutlined, ShopOutlined, ToolOutlined } from "@ant-design/icons";
import { Button, Col, Grid, Row, Space } from "antd";
import React, { useState } from "react"
import { useNavigate } from "react-router-dom";
import { Label } from "./ui/label";

function MobileNav ({mobileNav,setMobileNav,setCurrent}) {
    const navigate = useNavigate();
   return (
    <div className="fixed bg-white border-2 z-50 bottom-0 w-screen">
        <div className="h-[40px]">
            <Row className="h-full">
                <Col span={8} className="hover:bg-slate-200 hover:cursor-pointer" onClick={()=>{setMobileNav(0)
                setCurrent('0')
                    navigate('/dashboard')
                }}><div className="flex flex-col justify-center items-center h-full" >{<HomeOutlined style={{fontSize:'18px', color: mobileNav == 0 && 'blue'}}/>} <Label className="text-slate-500 font-normal text-xs">Home</Label></div></Col>
                <Col span={8} className="hover:bg-slate-200 hover:cursor-pointer" onClick={()=>{setMobileNav(1)
                     setCurrent(null)}}><div className="flex flex-col justify-center items-center h-full" >{<ToolOutlined style={{fontSize:'18px', color: mobileNav == 1 && 'blue'}}/>}<Label className="text-slate-500 font-normal text-xs">Tools</Label></div></Col>
                <Col span={8} className="hover:bg-slate-200 hover:cursor-pointer" onClick={()=>setMobileNav(2)}><div className="flex flex-col justify-center items-center h-full" >{<ShopOutlined style={{fontSize:'18px', color: mobileNav == 2 && 'blue'}}/>}<Label className="text-slate-500 font-normal text-xs">Store</Label></div></Col>
            </Row>
        </div>
   </div>
  )
};

export default MobileNav;
