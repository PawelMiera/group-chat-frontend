import "./common/constants.css";
import "./App.css";
import { LoginPage } from "./pages/LoginPage";
import { ChatPage } from "./pages/ChatPage";
import { JoinPage } from "./pages/JoinPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <CookiesProvider defaultSetOptions={{path:"/"}}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<LoginPage />} />
          </Routes>
        </AuthProvider>
      </Router>
    </CookiesProvider>
  );
}

export default App;
