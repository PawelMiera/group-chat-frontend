import { createContext, useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { fetchRefreshToken, fetchRotateToken } from "../services/ApiUser";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

interface AuthInterface {
  accessToken: string;
  refreshToken: string;
  signIn: (access_token: string, refresh_token: string) => boolean;
  signOut: () => void;
  updateRefreshToken: (refresh_token: string) => void;
  updateAccessToken: (access_token: string) => void;
  fetchTokens: () => Promise<[boolean, string]>;
  fetchAndUpdateTokens: () => Promise<[boolean, string]>;
  isAuthenticated: () => Promise<boolean>;
}

const AuthContext = createContext<AuthInterface>({} as AuthInterface);

export default AuthContext;

export const AuthProvider = ({ children }: { children: JSX.Element }) => {
  const [cookies, setCookie] = useCookies(["authRefresh"]);

  let [accessToken, updateAccessToken] = useState("");
  let [refreshToken, setRefreshToken] = useState(
    cookies.authRefresh ? cookies.authRefresh : ""
  );
  let navigate = useNavigate();

  const rotateToken = async () => {

    if (refreshToken != null && refreshToken != "") {
      let curr_access_token = accessToken;

      if (curr_access_token != null && curr_access_token != "") {

        const decoded_access_token = jwtDecode(curr_access_token);

        if (
          typeof decoded_access_token.exp != "undefined" &&
          dayjs.unix(decoded_access_token.exp).diff(dayjs()) < 1
        ) {
          const [ok, access] = await fetchAndUpdateTokens();
          if (ok) {
            curr_access_token = access;
          }
        }
      } else {
        const [ok, access] = await fetchAndUpdateTokens();
        if (ok) {
          curr_access_token = access;
        }
      }

      if (
        curr_access_token != null &&
        curr_access_token != ""
      ) {
        const decoded_refresh_token = jwtDecode(refreshToken);
        if (
          typeof decoded_refresh_token.exp != "undefined" &&
          dayjs.unix(decoded_refresh_token.exp).diff(dayjs()) < 172800000
        ) {
          try {
            const [ok, _, data] = await fetchRotateToken(`Bearer ${curr_access_token}`);
            if (ok) {
              updateRefreshToken(data["refresh"]);
              console.log("Rotated refresh token");
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
    }
    else{
      signOut();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => rotateToken(), 600000);
    return () => {
      clearInterval(interval);
    };
  }, [accessToken, refreshToken]);

  const updateRefreshToken = (refresh_token: string) => {
    setRefreshToken(refresh_token);
    setCookie("authRefresh", refresh_token);
  };

  const signIn = (access_token: string, refresh_token: string) => {
    updateAccessToken(access_token);
    updateRefreshToken(refresh_token);
    setCookie("authRefresh", refresh_token);
    return true;
  };

  const signOut = () => {
    console.log("SIGNING OUT");
    updateAccessToken("");
    setCookie("authRefresh", "");
    setRefreshToken("");
    navigate("/");
  };

  const fetchTokens = async (): Promise<[boolean, string]> => {
    try {
      let out_token = refreshToken;

      if (refreshToken == null || refreshToken == "") {
        out_token =
          cookies.authRefresh && cookies.authRefresh != "undefined"
            ? cookies.authRefresh
            : "";
        setRefreshToken(out_token);
      }
      if (out_token != "") {
        const [ok, _, data] = await fetchRefreshToken(out_token);
        if (ok) {
          return [true, data["access"]];
        }
      }
    } catch (error) {
      console.error(error);
    }

    return [false, ""];
  };

  const fetchAndUpdateTokens = async (): Promise<[boolean, string]> => {
    const [ok, access] = await fetchTokens();

    if (ok) {
      updateAccessToken(access);
    }

    return [ok, access];
  };

  const isAuthenticated = async () => {
    if (refreshToken == null || refreshToken == "") {
      const out_token = cookies.authRefresh ? cookies.authRefresh : "";
      if (out_token == null || out_token == "") {
        return false;
      }
    }
    const [ok] = await fetchAndUpdateTokens();
    return ok;
  };

  let contextData = {
    accessToken: accessToken,
    refreshToken: refreshToken,
    signIn: signIn,
    signOut: signOut,
    updateAccessToken: updateAccessToken,
    updateRefreshToken: updateAccessToken,
    fetchAndUpdateTokens: fetchAndUpdateTokens,
    isAuthenticated: isAuthenticated,
    fetchTokens: fetchTokens,
  };

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};
