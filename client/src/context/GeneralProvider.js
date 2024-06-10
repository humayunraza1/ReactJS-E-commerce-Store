import { createContext, useState } from "react";

const GeneralContext = createContext();

function GeneralProvider({children}){
    const [darkMode, setDarkMode] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [cart, setCart] = useState([]);
    return <GeneralContext.Provider value={{darkMode,setDarkMode,cart,setCart,isLoggedIn, setIsLoggedIn}}>
        {children}
    </GeneralContext.Provider>
}

export {GeneralProvider, GeneralContext}