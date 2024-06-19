import React, { useEffect, useMemo, useState } from "react"
import { axiosPrivate } from "../api/axios";
import useAuth from "../hooks/useAuth";
import useGeneral from '../hooks/useGeneral';
import { Avatar, Button } from "antd";
import { DataTableDemo } from "./Wishlist";
import { useNavigate } from "react-router-dom";

function DashHome () {

  const {auth} = useAuth();
  const {darkMode,isLoading,setIsLoading,wishlist,user,setUser} = useGeneral();
  const navigate = useNavigate();
  async function getDetails(){
    setIsLoading(true);
    try{
      const response = await axiosPrivate.get('http://localhost:3000/users/dashboard',{
        headers:{
          'Authorization':auth.token,
          'Content-Type': 'application/json'
        }

      })

     const {user} = response.data
      setUser({name:user.name, email:user.email, googleId:user.googleId, userId: user.userID, address:user.address})
      console.log(user.address)
    }catch(err){
      console.log(err)
    }finally{
      setIsLoading(false);
    }
  }
  useEffect(()=>{
   
    getDetails()
  
  },[])



  return (
    <>
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
        <div className="h-[200px] bg-green-200 rounded-lg p-4 flex items-center gap-5 justify-center">
          <div className="bg-blue-50 rounded-xl w-[150px] h-[150px] text-center justify-center flex flex-col">
            <p className="text-[4rem] text-slate-400">
              0
              </p>
              <p className="font-medium">
                Orders Placed
              </p>
          </div>
          <div className="bg-blue-50 rounded-xl w-[150px] h-[150px] text-center justify-center flex flex-col">
            <p className="text-[4rem] text-slate-400">
              0
              </p>
              <p className="font-medium">
                Orders Pending
              </p>
          </div>
          <div className="bg-blue-50 rounded-xl w-[150px] h-[150px] text-center justify-center flex flex-col">
            <p className="text-[4rem] text-slate-400">
              {wishlist.length}
              </p>
              <p className="font-medium">
                Wishlist
              </p>
          </div>
          <div className="bg-blue-50 rounded-xl w-[150px] h-[150px] text-center justify-center flex flex-col">
            <p className="text-[4rem] text-slate-400">
              0
              </p>
              <p className="font-medium">
                Disputes
              </p>
          </div>
        </div>
        <DataTableDemo/>
    </div>
    }
    </>
  )
};

export default DashHome;
