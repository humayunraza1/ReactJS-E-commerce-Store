import axios from "../api/axios";
import useAuth from "./useAuth2";
import useGeneral from "./useGeneral";


function useLogout(){
    const {setAuth} = useAuth();
    const {isLoggedIn,setIsLoggedIn} = useGeneral();

    async function logout(){
        setAuth({email: "", user: {}, token:""})
        if(isLoggedIn){
            setIsLoggedIn(false);
        }
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