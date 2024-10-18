import createRefresh from 'react-auth-kit/createRefresh';
import {fetchRefreshToken} from "./ApiUser"

const refreshToken = createRefresh({
    interval: 10,
    refreshApiCallback: async (param) => {
        try {
            const [ok, _, data] = await fetchRefreshToken(param.refreshToken || "");
            console.log("Refreshing token...")

            if(ok){
                return {
                    isSuccess: true,
                    newRefreshToken: data["refresh"],
                    newAuthToken: data["access"],
                    newAuthTokenExpireIn: 30,
                    newRefreshTokenExpiresIn: 43200
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