import axios from "../api/axios";
import useAuth from "./useAuth";


function useLogout(){
    const {setAuth} = useAuth();


    async function logout(){
        setAuth({email: "", user: {}, token:""})
        try{
            const response = await axios('/api/auth/logout',{
                withCredentials: true
            })
        }catch(err){
            console.log(err)
        }
    }
    return logout
}


export default useLogout;