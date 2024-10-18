import Login from "../components/Login/Login";
import NavBar from "../components/Navbar/NavBar";
import "./LoginPage.css"
import { useNavigate } from "react-router-dom";
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated'
import { useEffect } from "react";

export const LoginPage = () => {
  let navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated()

  useEffect(() => {

      if(isAuthenticated){
          navigate("/chat/")
      }

  }, []);



  return (
    <>
      <div className="loginBackground">
        <NavBar></NavBar>
        <Login></Login>
      </div>
    </>
  );
};
