import ChatComponent from "../components/ChatComponent/ChatComponent";
import {
  MessageInterface,
  GroupInterface,
  GroupMessagesInterface,
  UserInterface,
  CurrUserInterface,
} from "../common/types";
import "./ChatPage.css";
import GroupComponent from "../components/GroupComponent/GroupComponent";
import { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { v4 as uuidv4 } from "uuid";

import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import useAxios from "../utils/useAxios";
import { useNavigate } from "react-router-dom";

export const ChatPage = () => {
  const { accessToken, isAuthenticated } = useContext(AuthContext);

  const api = useAxios();

  const [groups, setGroups] = useState<GroupInterface[]>([]);
  const [currUser, setCurrUser] = useState<CurrUserInterface>({
    avatar: "",
    id: "-1",
    nickname: "",
    username: "",
    date_joined: "",
  });
  const [messages, setMessages] = useState<GroupMessagesInterface[]>([]);
  const [currMessages, setCurrMessages] = useState<MessageInterface[]>([]);
  const [users, setUsers] = useState<UserInterface[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("-1");
  const [newestMessageIndex, setNewestMessageIndex] = useState<number>(-1);
  let navigate = useNavigate();

  const handleWsMessage = (event: WebSocketEventMap["message"]) => {
    const msg = event.data;

    if (msg != "pong") {
      console.log("MSG: ", event.data);

      const curr_msg = JSON.parse(msg);

      const parsed_msg: MessageInterface = {
        author: curr_msg["author"],
        created: curr_msg["created"],
        msg: curr_msg["msg"],
      };

      const messages_copy = structuredClone(messages);

      const index = messages_copy.findIndex(
        (msgs) => msgs.group_id == curr_msg["group"]
      );

      if (index != -1) {
        messages_copy[index].messages = [
          ...messages_copy[index].messages,
          parsed_msg,
        ];
        setMessages(messages_copy);

        if (selectedGroupId == curr_msg["group"]) {
          setCurrMessages(messages_copy[index].messages);
          setNewestMessageIndex(messages_copy[index].messages.length - 1);
        }
      }

      const groups_copy = structuredClone(groups);

      const index_groups = groups_copy.findIndex(
        (grp) => grp.id == curr_msg["group"]
      );

      if (index != -1) {
        groups_copy[index_groups].last_msg = parsed_msg;
        const sorted_groups = groups_copy.sort(
          (a: GroupInterface, b: GroupInterface) =>
            Date.parse(b.last_msg.created) - Date.parse(a.last_msg.created)
        );
        setGroups(sorted_groups);
      }
    }

    return true;
  };


  const handleOnSendClicked = (msg: string) => {
    if (msg != "") {
      const full_msg = {
        msg: msg,
        uuid: uuidv4(),
        group: selectedGroupId.toString(),
      };
      console.log("SENDING", full_msg);
      sendWsMessage(JSON.stringify(full_msg));
    }
  };

  async function getGroups() {
    const response = await api.get("/chat/groups/all/?start=0&end=20");

    console.log(response);

    if (response.status === 201 || response.status=== 200) {
      const all_groups = response.data;
      console.log(all_groups);

      const sorted_groups = all_groups.groups.sort(
        (a: GroupInterface, b: GroupInterface) =>
          Date.parse(b.last_msg.created) - Date.parse(a.last_msg.created)
      );

      setGroups(sorted_groups);
      setUsers(all_groups.users);
      setMessages(all_groups.messages);
      setCurrUser(all_groups.curr_user);
      if(all_groups.groups.length > 0)
      {
        const selected_id = all_groups.groups[0].id;
        setSelectedGroupId(selected_id);
        const all_messages: GroupMessagesInterface[] = all_groups.messages;

        const curr_messages = all_messages.find(
          (message) => message.group_id === selected_id
        )?.messages;
  
        if (typeof curr_messages != "undefined") setCurrMessages(curr_messages);
      }

    } else {
      console.log("Failed to fetch groups: ", response.data);
    }
  }

  const handleNewGroup = async (group_uuid: string) => {
    sendMessage('{"command": "refreshGroups"}');

    try {
      const response = await api.get(`/chat/groups/?uuid=${group_uuid}`);
      if (response.status === 201 || response.status === 200) {

        const new_group: GroupInterface = {
          name: response.data["name"],
          id: response.data["id"],
          last_msg: response.data["last_msg"],
          members: response.data["members"],
          uuid: response.data["uuid"],
          avatar: response.data["avatar"],
        };

        const new_messages: GroupMessagesInterface = {
          messages: response.data["messages"],
          group_id: response.data["id"],
        };

        let new_groups = [...groups, new_group];
        const sorted_groups = new_groups.sort(
          (a: GroupInterface, b: GroupInterface) =>
            Date.parse(b.last_msg.created) - Date.parse(a.last_msg.created)
        );

        setGroups(sorted_groups);
        setMessages([...messages, new_messages]);
        setSelectedGroupId(response.data["id"]);
        setCurrMessages(response.data["messages"]);

        const users_copy = structuredClone(users);
        for (let i = 0; i < response.data["users"].length; i++) {
          const index = users.findIndex(
            (u) => u.id == response.data["users"][i].id
          );

          const new_user: UserInterface = response.data["users"][i];

          if (index != -1) {
            users_copy[index] = new_user;
          } else {
            users_copy.push(new_user);
          }
        }

        setUsers(users_copy);
      } else {
        console.log("Failed to get group", response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUserUpdated = (new_user: CurrUserInterface) => {
    setCurrUser(new_user);

    const users_copy = structuredClone(users);

    const new_name =
      new_user.nickname != "" ? new_user.nickname : new_user.username;

    const new_user_reduced: UserInterface = {
      id: new_user.id,
      avatar: new_user.avatar,
      date_joined: new_user.date_joined,
      name: new_name,
    };

    const index = users.findIndex((u) => u.id == new_user.id);

    if (index != -1) {
      users_copy[index] = new_user_reduced;
      setUsers(users_copy);
    }
  };

  const handleGroupUpdated = (new_group: GroupInterface) => {
    const groups_copy = structuredClone(groups);

    const ind = groups_copy.findIndex((x) => x.id === new_group.id);
    groups_copy[ind] = new_group;
    setGroups(groups_copy);
  };

  const handleGroupDeleted = (uuid: string, group_id: string) => {
    const filtered_groups = groups.filter((item) => item.uuid != uuid);
    setGroups(filtered_groups);
    setMessages(messages.filter((item) => item.group_id != uuid));

    if (filtered_groups.length > 0) {
      if (selectedGroupId == group_id) {
        setSelectedGroupId(filtered_groups[0].id);

        const curr_messages_temp = messages.find(
          (message) => message.group_id === filtered_groups[0].id
        )?.messages;

        if (typeof curr_messages_temp != "undefined") {
          setCurrMessages(curr_messages_temp);
        } else {
          setCurrMessages([]);
        }
      }
    } else {
      setSelectedGroupId("-1");
      setCurrMessages([]);
    }
  };

  const handleGroupSelected = (group_id: string) => {
    setSelectedGroupId(group_id);
    const curr_messages = messages.find(
      (message) => message.group_id === group_id
    )?.messages;

    if (typeof curr_messages != "undefined") setCurrMessages(curr_messages);
  };

  useEffect(() => {
    const startup = async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        navigate("/");
        return;
      }
      console.log("AUTH OK");
      await getGroups();
    }

    startup();

  }, []);

  const { sendMessage, readyState } = useWebSocket(`ws://127.0.0.1:8000/api/ws/chat?token=${accessToken}`, {
    onOpen: () => console.log("WS opened"),
    onClose: () => console.log("WS closed"),
    onMessage: handleWsMessage,
    shouldReconnect: () => true,
    reconnectAttempts: 1000,
    reconnectInterval: 1000,
    heartbeat: {
      message: '{"command": "ping"}',
      returnMessage: "pong",
      timeout: 20000,
      interval: 5000,
    },
  });

  const sendWsMessage = (msg: string) => {
    if (readyState == ReadyState.OPEN) sendMessage(msg);
  };

  return (
    <>
      <div className="chatGrid">
        <GroupComponent
          onNewGroupCreated={handleNewGroup}
          onUserUpdated={handleUserUpdated}
          users={users}
          groups={groups}
          curr_user={currUser}
          selected_group={selectedGroupId}
          onGroupSelected={handleGroupSelected}
          onGroupUpdated={handleGroupUpdated}
          onGroupDeleted={handleGroupDeleted}
        ></GroupComponent>
        <ChatComponent
          onSendClicked={handleOnSendClicked}
          messages={currMessages}
          user_id={currUser.id}
          curr_group_id={selectedGroupId}
          users={users}
          newest_msg_index={newestMessageIndex}
          onResetNewestMessageIndex={() => {
            setNewestMessageIndex(-1);
          }}
        ></ChatComponent>
      </div>
    </>
  );
};
