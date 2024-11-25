import "./LoginPage.css"
import { useNavigate} from "react-router-dom";
import { useEffect } from "react";

export const JoinPage = () => {
  let navigate = useNavigate();

  useEffect(() => {
    const queryParameters = new URLSearchParams(window.location.search);
    if (queryParameters.get("uuid") != null && queryParameters.get("key") != null)
    {
        localStorage.setItem("joinGroup", JSON.stringify({"uuid": queryParameters.get("uuid"), "key": queryParameters.get("key")}));
    }

    navigate("/");
  }, []);



  return (
    <>

    </>
  );
};
