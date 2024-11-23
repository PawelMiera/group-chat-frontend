
export interface MessageInterface {
    msg: string;
    author: number;
    created: string;
}

export interface GroupMessagesInterface {
    messages: MessageInterface[];
    group_id: number;
}

export interface GroupInterface {
    name: string;
    // last_msg: MessageInterface;
    last_activity: string;
    id: number;
    uuid: string;
    members: string[];
    avatar: string;
}


export interface UserInterface {
    name: string;
    date_joined: string;
    id: number;
    avatar: string;
}

export interface CurrUserInterface {
    username: string;
    nickname: string;
    date_joined: string;
    id: number;
    avatar: string;
    anonymous: boolean;
}


export interface AllGroupsInterface {
    curr_user: CurrUserInterface;
    groups: GroupInterface[];
    users: UserInterface[];
    messages: GroupMessagesInterface[];
    server_id: number;
}


export interface GroupEncryptionInterface {
    group_uuid: string;
    key: string;
}