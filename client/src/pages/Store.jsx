import React, { useContext, useEffect, useState } from "react"
import useLogout from "../hooks/useLogout";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
function Store () {
const {auth} = useAuth()
const navigate = useNavigate();
const location = useLocation();
const logout = useLogout();
const axiosPrivate = useAxiosPrivate();
const [details, setDetails] = useState({Name:"",Email:"" ,Role:""})
async function getDetails(){
  try{
    const response = await axiosPrivate.get('http://localhost:3000/users/dashboard',{
      headers:{'Content-Type': 'application/json',
      'Authorization' : auth.token
    },
    withCredentials:true      
  })
  
  const data = response.data
  setDetails({Name: data.user.name, Email: data.user.email, Role: data.user.role})
  // console.log(data);
}catch(err){
  console.log(err)
  navigate('/login',{state: {from: location}, replace: true})
}
}
async function signout(){
  await logout();
  navigate('/');
}
useEffect(()=>{
  if(auth.token !== ""){
  getDetails()
  }
},[auth])
  return (

    <>
    {auth?.token ? <> {details.Name} {details.Email} {details.Role} <button onClick={signout}>Logout</button></>:<Link to="/login">Login here</Link>}
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
