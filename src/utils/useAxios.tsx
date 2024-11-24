import axios from "axios";
import {InternalAxiosRequestConfig} from "axios";

import {ApiUrl} from "../services/Urls";

import {jwtDecode} from "jwt-decode"
import dayjs from "dayjs"

import { useContext } from "react";

import AuthContext from "../context/AuthContext"


const useAxios = () => {
    const {
        accessToken,
        signOut,
        reloadAccessToken,
      } = useContext(AuthContext);


    const axiosInstance = axios.create({
        baseURL: ApiUrl,
        headers: {'Content-type': 'application/json', "Authorization": `Bearer ${accessToken}`}
    });

    const onRequest = async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
        let isExpired = true;

        if(accessToken != "")
        {
            const decoded_token = jwtDecode(accessToken);
            if(typeof decoded_token.exp != "undefined")
            {
                isExpired = dayjs.unix(decoded_token.exp).diff(dayjs()) < 1;
            }
            if(!isExpired)
            {
                return config;
            }
        }

        let success = false;
        for(let i=0; i<3; i++)
        {
            const [ok, access] = await reloadAccessToken();
            if (ok)
            {
                success = true;
                config.headers.Authorization = `Bearer ${access}`
                break;
            }
        }

        if (!success)
        {
            console.log("FAILED TO AUTO RELOAD TOKENS")
            signOut(); // TODO navigate home
        }

        return config;
    }
    
    axiosInstance.interceptors.request.use(onRequest);

    return axiosInstance;
}

export default useAxios;