import { createContext, useState } from "react";

const GeneralContext = createContext();

function GeneralProvider({children}){
    const [darkMode, setDarkMode] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading,setIsLoading] = useState(false);
    const [wishlist,setWishlist] = useState([]);
    const [user,setUser]= useState({name:'',email:'',role:'', googleId:'',userId:0, address:'', number:''})
    const [cart, setCart] = useState([]);
    return <GeneralContext.Provider value={{darkMode,setDarkMode,cart,setCart,isLoggedIn, setIsLoggedIn,isLoading,setIsLoading,wishlist,setWishlist,user,setUser}}>
        {children}
    </GeneralContext.Provider>
}

export {GeneralProvider, GeneralContext}