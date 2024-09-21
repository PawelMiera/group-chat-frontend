import Login from "../components/Login/Login";
import NavBar from "../components/Navbar/NavBar";
import "./LoginPage.css"
export const LoginPage = () => {
  return (
    <>
      <div className="loginBackground">
        <NavBar></NavBar>
        <Login></Login>
      </div>
    </>
  );
};
