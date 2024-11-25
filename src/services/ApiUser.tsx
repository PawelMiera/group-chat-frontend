import {ApiUrl} from "./Urls";


export let fetchRegister = async (username: string, password: string) => {

    const requestOptions = {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({"username": username, "password": password}),
    };

    const response = await fetch(`${ApiUrl}/register/`, requestOptions);

    const data = await response.json();
    
    return [response.ok, response.status, data];
}; 


export let fetchRegisterAnonymous = async () => {

    const requestOptions = {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
    };

    const response = await fetch(`${ApiUrl}/registerAnonymous/`, requestOptions);

    const data = await response.json();
    
    return [response.ok, response.status, data];
}; 


export let fetchAccessToken = async (refresh: string) => {

    const requestOptions = {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({"refresh": refresh}),
    };

    const response = await fetch(`${ApiUrl}/token/refresh/`, requestOptions);

    const data = await response.json();
    
    return [response.ok, response.status, data];
};

export let fetchCheckIn = async (authHeader: string) => {
    const requestOptions = {
        method: 'GET',
        headers: {'Content-type': 'application/json', "Authorization": authHeader},
    };

    const response = await fetch(`${ApiUrl}/user/checkIn/`, requestOptions);

    return response.ok;
}; 



export let fetchRotateToken = async (authHeader: string) => {

    const requestOptions = {
        method: 'GET',
        headers: {'Content-type': 'application/json', "Authorization": authHeader},
    };

    const response = await fetch(`${ApiUrl}/token/rotate/`, requestOptions);

    const data = await response.json();
    
    return [response.ok, response.status, data];
}; 



// export let fetchGetUser = async (authHeader: string) => {

//     const requestOptions = {
//         method: 'GET',
//         headers: {'Content-type': 'application/json', "Authorization": authHeader},
//     };

//     const response = await fetch(`${ApiUrl}/user/`, requestOptions);

//     const data = await response.json();
    
//     return [response.ok, response.status, data];
// }; 


// export let fetchUpdateUser = async (authHeader: string, body_data: any) => {

//     const requestOptions = {
//         method: 'PATCH',
//         headers: {'Content-type': 'application/json', "Authorization": authHeader},
//         body: JSON.stringify(body_data)
//     };

//     const response = await fetch(`${ApiUrl}/user/`, requestOptions);

//     const data = await response.json();
    
//     return [response.ok, response.status, data];
// }; 