import Login from "../components/Login/Login";
import NavBar from "../components/Navbar/NavBar";
import "./LoginPage.css"
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

export const LoginPage = () => {
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
      <div className="loginBackground">
      <NavBar is_mobile={false}></NavBar>
      <Login is_mobile={false}></Login>
      </div>
    </>
  );
};
