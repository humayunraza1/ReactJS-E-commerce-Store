import axios, { axiosPrivate } from "../api/axios"
import useAuth from "./useAuth";
import useGeneral from "./useGeneral";
function useRefreshToken () {
    const {setAuth} = useAuth();
    const {setIsLoggedIn,setUser,setCart} = useGeneral();
    async function refresh(req,res){
    let response;
        try{

            response = await axios.get('/api/auth/refresh',{
                withCredentials:true
            })
            setAuth(prev => {
                return {...prev, 
                    user: {userID:response.data.user.userID, role:response.data.user.role},
                    token:response.data.newToken}
            })
            setIsLoggedIn(true);
        }catch(err){
            setIsLoggedIn(false);
            return res.status(403).send(err)
            
        }

        try{
            const getDetails = await axiosPrivate.get('/users/dashboard',{
              headers:{'Content-Type': 'application/json',
              'Authorization' : response.data.newToken
            },
            withCredentials:true      
          })
          
          const {user} = getDetails.data
          console.log(user)
          setUser({name:user.name, email:user.email, googleId:user.googleId,number:user.number, userId: user.userID, address:user.address})
        
          // console.log(data);
        }catch(err){
          console.log(err)
        }

        try{
            const getCart = await axiosPrivate.get('/users/getcart',{
              headers:{
                'Authorization':response.data.newToken,
                'Content-Type': 'application/json'
              }
            })
            setCart(getCart.data.cart)
            console.log(getCart.data.cart);
          }catch(err){
            console.log(err)
          }

        return response.data.newToken;
    }
    return refresh
};

export default useRefreshToken;
