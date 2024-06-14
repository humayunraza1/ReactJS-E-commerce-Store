import React, { useState } from "react"
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useGeneral from "../hooks/useGeneral";
import { Button } from "../components/ui/button"
import { jwtDecode } from "jwt-decode";
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "../components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import DarkSwitch from "../components/DarkSwitch";

export function Example() {
  return (
    <Carousel
      plugins={[
        Autoplay({
          delay: 2000,
        }),
      ]}
    >
      // ...
    </Carousel>
  )
}

function Login () {
    const {setAuth} = useAuth();
    const {darkMode,setIsLoggedIn} = useGeneral();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";
    const [logindetails, setLogindetails] = useState({email:"",password:""})
    const googleLogin = useGoogleLogin({
        onSuccess: async codeResponse => {
            console.log(codeResponse)
            axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${codeResponse.access_token}`, {
                        headers: {
                            Authorization: `Bearer ${codeResponse.access_token}`,
                            Accept: 'application/json'
                        }
                    })
                    .then((res) => {
                        console.log(res.data);
                        handleGoogleLogin(res.data)
                    })
                    .catch((err) => console.log(err));
        },
        onError: err => console.log(err)
    
    })

        // Function to handle the input changes
        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setLogindetails({
                ...logindetails,
                [name]: value
            });
        };


    async function handlelogin(t){
        const user = jwtDecode(t.credential)
        console.log(user);
    }


    async function handleGoogleLogin(user){
        setIsLoading(true)
        try{
            let name = user.given_name + ' ' +user.family_name; 
            const response = await axios.post('http://localhost:3000/api/auth/google', { email:user.email, id:user.id,name:name}, 
                {   
                    headers:{'Content-Type':'application/json'},
                    withCredentials: true 
                    })
                    console.log(response.data);
                    const accessToken = response?.data?.token
                    setAuth({user:response.data.user,token:accessToken})
                    setIsLoggedIn(true);
                    toast.success('Logged In Successfuly.')
                    navigate(from,{replace:true});  
        }catch(err){
            toast.error(err.response.data)
        }finally{
            setIsLoading(false)
        }

    }

    async function login(){
    setIsLoading(true)
        try{
            const response = await axios.post('http://localhost:3000/api/auth/login', { email:logindetails.email, password:logindetails.password }, 
            {   
                headers:{'Content-Type':'application/json'},
                withCredentials: true 
                });
            const accessToken = response?.data?.token
            console.log(response.data.data)
            setAuth({user:response.data.user,token:accessToken})
            setIsLoggedIn(true);
            toast.success('Logged In Successfuly.')
            navigate(from,{replace:true});  
                
        }catch(err){
            setIsLoggedIn(false);
            console.log(err.response.data);
            toast.error(err.response.data)

        }finally{
            setIsLoading(false);
        }
    
    }
    
    return (
        <>
        <div className={`flex justify-center items-center w-screen h-screen ${darkMode ? 'bg-black':'bg-white'}`}>
            <div className="card shadow-2xl w-[800px] h-96 rounded-2xl border-black flex">
                <div className="w-[50%] p-8 rounded-l-2xl flex justify-center">
                <div className="w-[250px]">

                    <div>
      <Label className="mt-5" htmlFor="email" >Email</Label>
      <Input disabled={isLoading} onChange={handleInputChange} type="email" name="email" id="email" placeholder="Email" className="w-[250px]"/>
                    </div>
        <div className="mt-2">
      <Label className="mt-5" htmlFor="password">Password</Label>
      <Input disabled={isLoading} onChange={handleInputChange} type="password" name="password" id="password" placeholder="Password"  className="w-[250px]"/>
        </div>
        <Button disabled={isLoading} onClick={login} className="mt-3">
            { isLoading ? <> <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Logging in </>:<>
                Login
            </>
                
            }
            
            </Button>
            <div className="mt-5 w-full flex flex-col justify-center">
        <Button onClick={googleLogin}>
        <img className="mr-2" width="28" height="28" src="https://img.icons8.com/color/48/google-logo.png" alt="google-logo"/>
            Google</Button>
            </div>
            <div className="mt-16 ml-[-60px]">
                <DarkSwitch/>
            </div>
            </div>
                </div>
                <div className="w-[50%] bg-slate-200 rounded-r-2xl flex flex-col justify-end">
                    <div className="text-center h-[17%] flex justify-center items-center">
                    <h1 className="font-Bebas text-2xl">Azzy's Hardware</h1>
                    </div>
                <div className="bg-slate-500 rounded-t-2xl h-[83%] flex flex-col justify-end w-full rounded-r-2xl">
                <div className="flex justify-center items-center w-ful h-full ">
                <Carousel className=" w-[220px] h-[220px]"  plugins={[
        Autoplay({
          delay: 2000,
        }),
      ]}>
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-4xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
    </div>
                <div className="bg-slate-900 p-5 text-center text-white rounded-t-2xl rounded-r-2xl h-[23%] shadow-[rgba(0,0,15,0.1)_0px_-5px_4px_0px] w-full">
                                           Haven't signed up?
                        
                    <Button className="text-red ml-5" variant='ghost' onClick={()=>navigate('/register')}>Register</Button>
                </div>

                </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default Login;


