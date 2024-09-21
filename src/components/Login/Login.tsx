import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import "./Login.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors] = useState({ email: "", password: "" });
  let navigate = useNavigate();

  // const validateForm = () => {
  //   const newErrors = {email: "", password: ""};
  //   if (!email) newErrors.email = 'Email is required';
  //   else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
  //   if (!password) newErrors.password = 'Password is required';
  //   else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
  //   return newErrors;
  // };

  // const handleSubmit = (event) => {
  //   event.preventDefault();
  //   const formErrors = validateForm();
  //   if (Object.keys(formErrors).length > 0) {
  //     setErrors(formErrors);
  //   } else {
  //     setErrors({});
  //     console.log('Login attempted with:', { email, password });
  //     // Here you would typically send a request to your server
  //   }
  // }; onSubmit={handleSubmit}

  return (
    <div className="login-wrapper">
      <div className="login-form-container">
        <h2 className="login-title text-dark mb-3">Anonymous</h2>
        <Form className="login-form">
    
          <Button variant="primary" type="submit" className="login-button defaultAppColor" onClick= {() => navigate("/chat")}>
            Enter anonymously
          </Button>
        </Form>
        <h2 className="login-title text-dark my-3">Login / Register</h2>
        <Form className="login-form">
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label className="text-dark">Username or Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label className="text-dark">Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>

          <Button variant="primary" type="submit" className="login-button defaultAppColor">
            Login / Register
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Login;
