// import NavBar from "../components/NavBar";
import ChatComponent from "../components/ChatComponent/ChatComponent";
import {MessageInterface, GroupInterface, AllGroupsInterface, GroupMessagesInterface, UserInterface} from "../common/types"
import "./ChatPage.css";
import GroupComponent from "../components/GroupComponent/GroupComponent";
import {fetchGroups} from "../services/ApiChat"
import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { v4 as uuidv4 } from 'uuid';


export const ChatPage = () => {
  let navigate = useNavigate();
  const authHeader = useAuthHeader();
  const socketUrl = `ws://127.0.0.1:8000/api/ws/chat?token=${authHeader?.replace("Bearer ", "")}`;


  const [groups, setGroups] = useState<GroupInterface[]>([]);
  const [currUser, setCurrUser] = useState("-1");
  const [messages, setMessages] = useState<GroupMessagesInterface[]>([]);
  const [currMessages, setCurrMessages] = useState<MessageInterface[]>([]);
  // const [pendingMessages, setPendingMessages] = useState<Record<string, MessageInterface>>();
  const [users, setUsers] = useState<UserInterface[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("0");

  const handleWsMessage = (event: WebSocketEventMap['message']) =>
  {
    const msg = event.data;

    if(msg != "pong")
    {
      console.log("MSG: ",event.data);

      const curr_msg = JSON.parse(msg);

      const parsed_msg: MessageInterface = {
        author: curr_msg["author"],
        created: curr_msg["created"],
        msg:  curr_msg["msg"]
      }

      const messages_copy = structuredClone(messages);

      const index = messages_copy.findIndex((msgs) => msgs.group_id == curr_msg["group"]);

      if (index != -1)
      {
        messages_copy[index].messages = [...messages_copy[index].messages, parsed_msg]
        setMessages(messages_copy);

        if (selectedGroup == curr_msg["group"])
        {
          setCurrMessages(messages_copy[index].messages);
        }
      }

    }

    return true;
  }

  const sendWsMessage = (msg: string) =>
  {
    if (readyState == ReadyState.OPEN)
      sendMessage(msg);
  }

  const handleOnSendClicked = (msg: string) =>
    {
      if (msg != "")
      {
        const full_msg = {"msg": msg, "uuid": uuidv4(), "group": selectedGroup.toString()};
        console.log("SENDING", full_msg);
        sendWsMessage(JSON.stringify(full_msg));
      }

    }

  const {
    sendMessage,
    readyState,
  } = useWebSocket(socketUrl, {
    onOpen: () => console.log('opened'),
    onClose: () => console.log("closed"),
    onMessage: handleWsMessage,
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: () => true,
    reconnectAttempts: 1000,
    reconnectInterval: 1000,
    heartbeat: {
      message: '{\"command\": \"ping\"}',
      returnMessage: 'pong',
      timeout: 20000, 
      interval: 5000,
    },
  });



  async function getGroups() 
  {
    const [ok, _, data] = await fetchGroups(authHeader || "");

    if(ok)
    {
      const all_groups = JSON.parse(data.toString());
      console.log(all_groups);

      
      setGroups(all_groups.groups);
      setUsers(all_groups.users);
      setMessages(all_groups.messages);
      setCurrUser(all_groups.curr_user);
      const selected_id = all_groups.groups[0].id;
      setSelectedGroup(selected_id);
      const all_messages: GroupMessagesInterface[] = all_groups.messages;

      const curr_messages = all_messages.find((message) => message.group_id === selected_id)?.messages;

      if (typeof curr_messages != "undefined")
        setCurrMessages(curr_messages);
    }
    else
    {
      console.log("Failed to fetch groups: ", data);
    }
  }




  useEffect(() => {
    getGroups();
  }, []);

    const handle_group_selected = (group_id: string) => {
      setSelectedGroup(group_id);
      const curr_messages = messages.find((message) => message.group_id === group_id)?.messages;

      if (typeof curr_messages != "undefined")
        setCurrMessages(curr_messages);    
      }



  return (
    <>
      <div className="chatGrid">
        <GroupComponent users={users} groups={groups} selected_group={selectedGroup} onGroupSelected={handle_group_selected}></GroupComponent>
        <ChatComponent onSendClicked={handleOnSendClicked} messages={currMessages} user_id={currUser}></ChatComponent>
      </div>
    </>
  );
};
