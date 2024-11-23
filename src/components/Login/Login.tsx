import { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { fetchRegister, fetchRegisterAnonymous } from "../../services/ApiUser";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";

const Login = () => {
  const starting_email = localStorage.getItem("username");
  const [email, setEmail] = useState(
    starting_email != null ? starting_email : ""
  );
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  let navigate = useNavigate();

  const { signIn } = useContext(AuthContext);

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    if (!email) newErrors.email = "Email or Username is required";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    setErrors(newErrors);
    if (newErrors.email == "" && newErrors.password == "") {
      return true;
    } else {
      return false;
    }
  };

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (validateForm()) {
      try {
        const [ok, _, result] = await fetchRegister(email, password);
        if (ok) {
          localStorage.setItem("username", email);

          signIn(result["access"], result["refresh"]);

          navigate("/chat/");
        } else {
          setErrors({ password: result.password, email: result.username });
        }
      } catch (error) {
        console.log("APi error:", error);
      }
    }
  };


  const handleAnonymous = async () => {
    try {
      const [ok, _, result] = await fetchRegisterAnonymous();
      if (ok) {
        signIn(result["access"], result["refresh"]);
        navigate("/chat/");
      } else {
        setErrors({ password: result.password, email: result.username });
      }
    } catch (error) {
      console.log("APi error:", error);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-form-container">
        <h2 className="login-title mb-3 loginColWhite">Anonymous</h2>
        <Button
          variant="primary"
          className="login-button defaultAppColor"
          onClick={handleAnonymous}
        >
          Enter anonymously
        </Button>
        <h2 className="login-title my-3 loginColWhite">Login / Register</h2>
        <Form className="login-form">
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label className="loginColWhite">Email or Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter email or username"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label className="loginColWhite">Password</Form.Label>
            <Form.Control
              type="password"
              autoComplete="new-password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="login-button defaultAppColor"
            onClick={handleSubmit}
          >
            Login / Register
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Login;
