import React, { useContext, useEffect, useState } from "react"
import axios from 'axios';
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function Store () {
const {auth} = useAuth()
const [details, setDetails] = useState({Name:"",Email:"" ,Role:""})
async function getDetails(){
  const response = await axios.get('http://localhost:3000/users/dashboard',{
    headers:{'Content-Type': 'application/json',
            'Authorization' : auth.token
    },
    withCredentials:true      
  })

  const data = response.data
  setDetails({Name: data.user.name, Email: data.user.email, Role: data.user.role})
  console.log(data);
}

useEffect(()=>{
  if(auth.token !== ""){
  getDetails()
  }
},[auth])
  return (

    <>
    {auth?.token ? `${details.Name} ${details.Email} ${details.Role}`:<Link to="/login">Login here</Link>}
    <div>
        <h1>Welcome to the online ecom store</h1>
        <Link to="/admin">Admin</Link>
        <br />
        <Link to="/settings">User Dashboard</Link>
    </div>
    </>
  )
};

export default Store;
