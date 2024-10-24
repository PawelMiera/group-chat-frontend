// import NavBar from "../components/NavBar";
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
import { fetchGroups, fetchGetGroup } from "../services/ApiChat";
import { useEffect, useState } from "react";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { v4 as uuidv4 } from "uuid";

export const ChatPage = () => {
  const authHeader = useAuthHeader();
  const socketUrl = `ws://127.0.0.1:8000/api/ws/chat?token=${authHeader?.replace(
    "Bearer ",
    ""
  )}`;

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
  // const [pendingMessages, setPendingMessages] = useState<Record<string, MessageInterface>>();
  const [users, setUsers] = useState<UserInterface[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("0");
  const [newestMessageIndex, setNewestMessageIndex] = useState<number>(-1);


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

        if (selectedGroup == curr_msg["group"]) {
          setCurrMessages(messages_copy[index].messages);
          setNewestMessageIndex(messages_copy[index].messages.length - 1)
        }
      }

      const groups_copy = structuredClone(groups);

      const index_groups = groups_copy.findIndex(
        (grp) => grp.id == curr_msg["group"]
      );

      if (index != -1) {
        groups_copy[index_groups].last_msg = parsed_msg;
        setGroups(groups_copy);
      }
    }

    return true;
  };

  const { sendMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => console.log("opened"),
    onClose: () => console.log("closed"),
    onMessage: handleWsMessage,
    //Will attempt to reconnect on all close events, such as server shutting down
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

  const handleOnSendClicked = (msg: string) => {
    if (msg != "") {
      const full_msg = {
        msg: msg,
        uuid: uuidv4(),
        group: selectedGroup.toString(),
      };
      console.log("SENDING", full_msg);
      sendWsMessage(JSON.stringify(full_msg));
    }
  };

  async function getGroups() {
    const [ok, _, data] = await fetchGroups(authHeader || "");

    if (ok) {
      const all_groups = JSON.parse(data.toString());
      console.log(all_groups);

      setGroups(all_groups.groups);
      setUsers(all_groups.users);
      setMessages(all_groups.messages);
      setCurrUser(all_groups.curr_user);
      const selected_id = all_groups.groups[0].id;
      setSelectedGroup(selected_id);
      const all_messages: GroupMessagesInterface[] = all_groups.messages;

      const curr_messages = all_messages.find(
        (message) => message.group_id === selected_id
      )?.messages;

      if (typeof curr_messages != "undefined") setCurrMessages(curr_messages);
    } else {
      console.log("Failed to fetch groups: ", data);
    }
  }

  const handleNewGroup = async (group_id: string) => {
    sendMessage('{"command": "refreshGroups"}');
    const [ok, _, data] = await fetchGetGroup(authHeader || "", group_id);
    try {
      if (ok) {
        console.log(data);

        const new_group: GroupInterface = {
          name: data["name"],
          id: data["id"],
          last_msg: data["last_msg"],
          members: data["members"],
          uuid: data["uuid"],
          avatar: data["avatar"],
        };

        const new_messages: GroupMessagesInterface = {
          messages: data["messages"],
          group_id: data["id"],
        };

        setGroups([...groups, new_group]);
        setMessages([...messages, new_messages]);

        const users_copy = structuredClone(users);
        for (let i = 0; i < data["users"].length; i++) {
          const index = users.findIndex((u) => u.id == data["users"][i].id);

          const new_user: UserInterface = data["users"][i];

          if (index != -1) {
            users_copy[index] = new_user;
          } else {
            users_copy.push(new_user);
          }
        }

        setUsers(users_copy);
      } else {
        console.log("Failed to get group", data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUserUpdated = (new_user: CurrUserInterface) => {
    setCurrUser(new_user);

  }

  useEffect(() => {
    getGroups();
  }, []);

  const handle_group_selected = (group_id: string) => {
    setSelectedGroup(group_id);
    const curr_messages = messages.find(
      (message) => message.group_id === group_id
    )?.messages;

    if (typeof curr_messages != "undefined") setCurrMessages(curr_messages);
  };


  return (
    <>
      <div className="chatGrid">
        <GroupComponent
          newGroupCreated={handleNewGroup}
          userUpdated={handleUserUpdated}
          users={users}
          groups={groups}
          curr_user={currUser}
          selected_group={selectedGroup}
          onGroupSelected={handle_group_selected}
        ></GroupComponent>
        <ChatComponent
          onSendClicked={handleOnSendClicked}
          messages={currMessages}
          user_id={currUser.id}
          curr_group_id={selectedGroup}
          users={users}
          newest_msg_index={newestMessageIndex}
          onResetNewestMessageIndex={() => {setNewestMessageIndex(-1);}}
        ></ChatComponent>
      </div>
    </>
  );
};
