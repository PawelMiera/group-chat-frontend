
const API_BASE_URL = "http://localhost:8000/api";

export let fetchGroups = async (authHeader: string) => {

    const requestOptions = {
        method: 'GET',
        headers: {'Content-type': 'application/json', "Authorization": authHeader},
    };

    const response = await fetch(`${API_BASE_URL}/chat/groups/all/?start=0&end=20`, requestOptions);

    const data = await response.text();
    
    return [response.ok, response.status, data];
}; 

export let fetchGetGroupsMessages = async (authHeader: string, groupsCsv: string) => {

    const requestOptions = {
        method: 'POST',
        headers: {'Content-type': 'application/json', "Authorization": authHeader},
        body: JSON.stringify({"groups": groupsCsv, "start": 0, "end": 20}),
    };

    const response = await fetch(`${API_BASE_URL}/chat/groups/messages/`, requestOptions);

    const data = await response.text();
    
    return [response.ok, response.status, data];
}; 

export let fetchCreateNewGroup = async (authHeader: string, groupName: string) => {

    const requestOptions = {
        method: 'POST',
        headers: {'Content-type': 'application/json', "Authorization": authHeader},
        body: JSON.stringify({"group_name": groupName}),
    };

    const response = await fetch(`${API_BASE_URL}/chat/groups/new/`, requestOptions);

    const data = await response.json();
    
    return [response.ok, response.status, data];
};


export let fetchJoinGroup = async (authHeader: string, groupId: string) => {

    const requestOptions = {
        method: 'POST',
        headers: {'Content-type': 'application/json', "Authorization": authHeader},
        body: JSON.stringify({"group_id": groupId}),
    };

    const response = await fetch(`${API_BASE_URL}/chat/groups/join/`, requestOptions);

    const data = await response.json();
    
    return [response.ok, response.status, data];
}; 


export let fetchGetGroup = async (authHeader: string, groupId: string) => {

    const requestOptions = {
        method: 'GET',
        headers: {'Content-type': 'application/json', "Authorization": authHeader},
    };
    console.log("ID",groupId , `${API_BASE_URL}/chat/groups/?group_id=${groupId}`);

    const response = await fetch(`${API_BASE_URL}/chat/groups/?group_id=${groupId}`, requestOptions);

    const data = await response.json();
    
    return [response.ok, response.status, data];
}; 