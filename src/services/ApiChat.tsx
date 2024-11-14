import {ApiUrl} from "./Urls";

export let fetchGroups = async (authHeader: string) => {

    const requestOptions = {
        method: 'GET',
        headers: {'Content-type': 'application/json', "Authorization": authHeader},
    };

    const response = await fetch(`${ApiUrl}/chat/groups/all/?start=0&end=20`, requestOptions);

    const data = await response.text();
    
    return [response.ok, response.status, data];
}; 

export let fetchGetGroupsMessages = async (authHeader: string, groupsCsv: string) => {

    const requestOptions = {
        method: 'POST',
        headers: {'Content-type': 'application/json', "Authorization": authHeader},
        body: JSON.stringify({"groups": groupsCsv, "start": 0, "end": 20}),
    };

    const response = await fetch(`${ApiUrl}/chat/groups/messages/`, requestOptions);

    const data = await response.text();
    
    return [response.ok, response.status, data];
}; 

export let fetchCreateNewGroup = async (authHeader: string, groupName: string) => {

    const requestOptions = {
        method: 'POST',
        headers: {'Content-type': 'application/json', "Authorization": authHeader},
        body: JSON.stringify({"name": groupName}),
    };

    const response = await fetch(`${ApiUrl}/chat/groups/new/`, requestOptions);

    const data = await response.json();
    
    return [response.ok, response.status, data];
};


export let fetchJoinGroup = async (authHeader: string, groupUuid: string) => {

    const requestOptions = {
        method: 'POST',
        headers: {'Content-type': 'application/json', "Authorization": authHeader},
        body: JSON.stringify({"uuid": groupUuid}),
    };

    const response = await fetch(`${ApiUrl}/chat/groups/join/`, requestOptions);

    const data = await response.json();
    
    return [response.ok, response.status, data];
}; 


export let fetchGetGroup = async (authHeader: string, groupUuid: string) => {

    const requestOptions = {
        method: 'GET',
        headers: {'Content-type': 'application/json', "Authorization": authHeader},
    };
    console.log("ID",groupUuid , `${ApiUrl}/chat/groups/?uuid=${groupUuid}`);

    const response = await fetch(`${ApiUrl}/chat/groups/?uuid=${groupUuid}`, requestOptions);

    const data = await response.json();
    
    return [response.ok, response.status, data];
}; 


export let fetchUpdateGroup = async (authHeader: string, body_data: any) => {

    const requestOptions = {
        method: 'PATCH',
        headers: {'Content-type': 'application/json', "Authorization": authHeader},
        body: JSON.stringify(body_data)
    };

    const response = await fetch(`${ApiUrl}/chat/groups/`, requestOptions);

    const data = await response.json();
    
    return [response.ok, response.status, data];
}; 


export let fetchDeleteGroup = async (authHeader: string, uuid: string) => {

    const requestOptions = {
        method: 'DELETE',
        headers: {'Content-type': 'application/json', "Authorization": authHeader},
        body: JSON.stringify({"uuid": uuid })
    };

    const response = await fetch(`${ApiUrl}/chat/groups/`, requestOptions);

    const data = await response.text();

    console.log(data, response.status, response.ok);
    
    return [response.ok, response.status, data];
}; 