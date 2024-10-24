import "./common/constants.css";
import "./App.css";
import { LoginPage } from "./pages/LoginPage";
import { ChatPage } from "./pages/ChatPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthProvider from 'react-auth-kit';
import createStore from 'react-auth-kit/createStore';
import refreshToken from "./services/RefreshTokens"
import RequireAuth from '@auth-kit/react-router/RequireAuth'
import { CookiesProvider } from 'react-cookie'

function App() {


  const store = createStore({
    authName:'_auth',
    authType:'cookie',
    cookieDomain: window.location.hostname,
    cookieSecure: false,
    refresh: refreshToken,
  });


  return (
    <CookiesProvider>
      <AuthProvider store={store}>
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/chat" element={
              <RequireAuth fallbackPath="/login/">
                <ChatPage />
              </RequireAuth>
              } />
            <Route path="/*" element={<LoginPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </CookiesProvider>
  );
}

export default App;
