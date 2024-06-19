import axios from "../api/axios"
import useAuth from "./useAuth";
import useGeneral from "./useGeneral";
function useRefreshToken () {
    const {auth,setAuth} = useAuth();
    const {setIsLoggedIn} = useGeneral();
    async function refresh(req,res){
    let response;
        try{

            response = await axios.get('/api/auth/refresh',{
                withCredentials:true
            })
            setAuth(prev => {
                console.log(prev)
                console.log(response.data)
                return {...prev, 
                    user: {userID:response.data.user.userID, role:response.data.user.role},
                    token:response.data.newToken}
            })
            setIsLoggedIn(true);
        }catch(err){
            setIsLoggedIn(false);
            return res.status(403).send(err)
            
        }
        return response.data.newToken;
    }
    return refresh
};

export default useRefreshToken;
