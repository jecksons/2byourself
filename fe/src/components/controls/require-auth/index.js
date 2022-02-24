import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import UserContext from "../../../store/user-context";

export default function RequireAuth({children}) {
    const location = useLocation();
    const {userInfo} = useContext(UserContext);
    return userInfo ? children : <Navigate to={`/login${location.pathname !== '/login' ?  `/?originalPath=${location.pathname}` : '' }`} />
}