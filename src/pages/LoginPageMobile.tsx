import Login from "../components/Login/Login";
import NavBar from "../components/Navbar/NavBar";
import "./LoginPageMobile.css"
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";




export const LoginPageMobile = () => {
  let navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);


  useEffect(() => {
    const startup = async () => {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        navigate("/groopie/chat");
        return;
      }
    }

    startup();

  }, []);



  return (
    <>
      <div className="loginBackgroundMobile">
        <NavBar is_mobile={true}></NavBar>
        <Login is_mobile={true}></Login>
      </div>
    </>
  );
};
