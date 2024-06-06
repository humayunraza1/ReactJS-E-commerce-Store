import axios from "../api/axios"
import useAuth from "./useAuth";
function useRefreshToken () {
    const {auth,setAuth} = useAuth();
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
        }catch(err){
            return res.status(403).send(err)
        }
        return response.data.newToken;
    }
    return refresh
};

export default useRefreshToken;
