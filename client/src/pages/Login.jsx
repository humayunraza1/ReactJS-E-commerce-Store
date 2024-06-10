import React, { useState } from "react"
import axios from 'axios';
import { Navigate, Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useGeneral from "../hooks/useGeneral";

function Login () {
    const {setAuth} = useAuth();
    const {darkMode,setIsLoggedIn} = useGeneral();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";
    const [logindetails, setLogindetails] = useState({email:"",password:""})


        // Function to handle the input changes
        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setLogindetails({
                ...logindetails,
                [name]: value
            });
        };

    async function login(){
    
        try{
            const response = await axios.post('http://localhost:3000/api/auth/login', { email:logindetails.email, password:logindetails.password }, 
            {   
                headers:{'Content-Type':'application/json'},
                withCredentials: true 
                });
            const accessToken = response?.data?.token
            console.log(response.data)
            setAuth({user:response.data.user,token:accessToken})
            setIsLoggedIn(true);
            navigate(from,{replace:true});  
                
        }catch(err){
            setIsLoggedIn(false);
            console.log(err);
        }
    
    }

    return (
        <>
    <div className={`h-[100dvh] flex justify-center items-center ${darkMode ? 'bg-black':'bg-slate-500'}`}>
      <form action="#" method="post">
        <input type="email" name="email" value={logindetails.email} onChange={handleInputChange} id="email" />
        <input type="password" name="password" value={logindetails.password} onChange={handleInputChange} id="password" />
        <button type="submit" onClick={(e)=>{
            e.preventDefault();
            login()
        }}>Login</button>
      </form>
    </div>
    
    
        </>
  )
};

export default Login;
