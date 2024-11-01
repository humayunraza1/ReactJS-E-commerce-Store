import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";

function useAuth2(){
    return useContext(AuthContext)
}

export default useAuth2;