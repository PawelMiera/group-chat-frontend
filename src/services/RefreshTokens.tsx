import createRefresh from 'react-auth-kit/createRefresh';
import {fetchRefreshToken} from "./ApiUser"

const refreshToken = createRefresh({
    interval: 50,
    refreshApiCallback: async (param) => {
        try {
            const [ok, _, data] = await fetchRefreshToken(param.refreshToken || "");
            console.log("Refreshing token...")

            if(ok){
                console.log("Token ok", data["access"]);


                return {
                    isSuccess: true,
                    newRefreshToken: data["refresh"],
                    newAuthToken: data["access"],
                    newAuthTokenExpireIn: 60,
                    newRefreshTokenExpiresIn: 86400
                  }
            }
            else
            {
                return {
                    isSuccess: false,
                    newAuthToken: "",
                  }    
            }

          }
          catch(error){
            console.error(error)
            return {
              isSuccess: false,
              newAuthToken: "",
            } 
          }
    },
});

export default refreshToken;