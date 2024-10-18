
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
}


export interface UserInterface {
    name: string;
    date_joined: string;
    id: string;
}


export interface AllGroupsInterface {
    groups: GroupInterface[];
    users: UserInterface[];
    messages: GroupMessagesInterface[];
    curr_user: string;
}
