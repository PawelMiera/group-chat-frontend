import "./common/constants.css";
import "./App.css";
import { LoginPage } from "./pages/LoginPage";
import { LoginPageMobile } from "./pages/LoginPageMobile";
import { ChatPage } from "./pages/ChatPage";
import { JoinPage } from "./pages/JoinPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import { AuthProvider } from "./context/AuthContext";
import { useState, useEffect } from "react";

function App() {
  const [devOrientation, setDevOrientation] = useState(
    window.screen.orientation.type.includes("portrait")
  );

  useEffect(() => {
    window
      .matchMedia("(orientation: portrait)")
      .addEventListener("change", (e) => {
        const portrait = e.matches;
        setDevOrientation(portrait);
      });
  }, []);

  return (
    <CookiesProvider defaultSetOptions={{path:"/"}}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/groopie/" element={!devOrientation ? <LoginPage /> : <LoginPageMobile/>} />
            <Route path="/groopie/chat/" element={<ChatPage is_mobile={devOrientation}/>} />
            <Route path="/groopie/chat" element={<ChatPage is_mobile={devOrientation}/>} />
            <Route path="/groopie/join/" element={<JoinPage />} />
            <Route path="/groopie/join" element={<JoinPage />} />
            <Route path="/groopie/login/" element={!devOrientation ? <LoginPage /> : <LoginPageMobile/>} />
            <Route path="/groopie/login" element={!devOrientation ? <LoginPage /> : <LoginPageMobile/>} />
            <Route path="/groopie/*" element={!devOrientation ? <LoginPage /> : <LoginPageMobile/>} />
            <Route path="/groopie/*/" element={!devOrientation ? <LoginPage /> : <LoginPageMobile/>} />
          </Routes>
        </AuthProvider>
      </Router>
    </CookiesProvider>
  );
}

export default App;
