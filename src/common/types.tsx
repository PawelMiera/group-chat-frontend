
export interface MessageInterface {
    msg: string;
    author: string;
    created: string;
}

export interface GroupMessagesInterface {
    messages: MessageInterface[];
    group_id: string;
}

export interface GroupInterface {
    name: string;
    last_msg: MessageInterface;
    id: string;
    uuid: string;
    members: string[];
    avatar: string;
}


export interface UserInterface {
    name: string;
    date_joined: string;
    id: string;
    avatar: string;
}

export interface CurrUserInterface {
    username: string;
    nickname: string;
    date_joined: string;
    id: string;
    avatar: string;
}


export interface AllGroupsInterface {
    groups: GroupInterface[];
    users: UserInterface[];
    messages: GroupMessagesInterface[];
    curr_user: string;
}


export interface GroupEncryptionInterface {
    group_uuid: string;
    key: string;
}