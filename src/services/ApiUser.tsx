const API_BASE_URL = "http://localhost:8000/api";


export let fetchRegister = async (username: string, password: string) => {

    const requestOptions = {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({"username": username, "password": password}),
    };

    const response = await fetch(`${API_BASE_URL}/register/`, requestOptions);

    const data = await response.json();
    
    return [response.ok, response.status, data];
}; 


export let fetchRefreshToken = async (refresh: string) => {

    const requestOptions = {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({"refresh": refresh}),
    };

    const response = await fetch(`${API_BASE_URL}/token/refresh/`, requestOptions);

    const data = await response.json();
    
    return [response.ok, response.status, data];
}; 