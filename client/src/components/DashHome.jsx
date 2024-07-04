import React, { useEffect, useMemo, useState } from "react"
import { axiosPrivate } from "../api/axios";
import useAuth from "../hooks/useAuth";
import useGeneral from '../hooks/useGeneral';
import { Avatar, Button } from "antd";
import { DataTableDemo } from "./Wishlist";
import { useNavigate } from "react-router-dom";

function DashHome ({className}) {

  const {darkMode,isLoading,user,setUser} = useGeneral();
  const navigate = useNavigate();

  return (
    <div className={className}>
    { isLoading ? <h1>Loading....</h1> :

      <div className={`${darkMode ? 'text-white':'text-black'} flex flex-col justify-center w-full items-center gap-5`}>
      <div className="bg-blue-200 z-20 p-4 w-[380px] h-auto rounded-lg flex items-center justify-between">
        <Avatar style={{width:'140px', height:'140px'}} className="z-20">
          <p className="text-[65px]">
            HR
          </p>
        </Avatar>
        <div>
        <h2 className="text-lg">{user.name}</h2>
        <p className="text-md">{user.email}</p>
        <Button type="primary" ghost className="mt-3" onClick={()=>{navigate('/dashboard?tab=settings')}}>Edit</Button>
        </div>
      </div>
       {/* Add Numerical Data Here */}
        <DataTableDemo/>
    </div>
    }
    </div>
  )
};

export default DashHome;
