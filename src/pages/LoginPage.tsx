import Login from "../components/Login/Login";
import NavBar from "../components/Navbar/NavBar";
import "./LoginPage.css"
import {fetchRefreshToken} from "../services/ApiUser"
import {useEffect} from "react";
import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
  let navigate = useNavigate();

  async function getToken(token: string) 
  {
    const [ok, _, data] = await fetchRefreshToken(token);

    if(ok)
    {
      localStorage.setItem("accessToken", data["access"]);
      localStorage.setItem("refreshToken", data["refresh"]);
      navigate("/chat/");
    }
    else
    {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
    
  }


  const refresh_token = localStorage.getItem("refreshToken");
  
  useEffect(() => {
    if (refresh_token!= null)
    {
      getToken(refresh_token);
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
