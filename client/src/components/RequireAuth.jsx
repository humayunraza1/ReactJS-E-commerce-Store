import { useLocation,Navigate,Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
function RequireAuth ({allowedRole}) {
    const {auth} = useAuth();
    const location = useLocation();
    return (
        auth?.user?.role == allowedRole ? <Outlet/> : auth?.token !== "" ? <Navigate to="/unauthorized" state={{from:location}} replace/> :
         <Navigate to="/login" state={{from:location}} replace/>
  )
};

export default RequireAuth;
