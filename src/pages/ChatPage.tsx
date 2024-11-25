import ChatComponent from "../components/ChatComponent/ChatComponent";
import {
  MessageInterface,
  GroupInterface,
  GroupMessagesInterface,
  UserInterface,
  CurrUserInterface,
  GroupEncryptionInterface,
  AllGroupsInterface,
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
import { useCookies } from "react-cookie";

import { decrypt, encrypt } from "../utils/Encryption";

import { WsUrl } from "../services/Urls";

interface ChatPageProps {
  is_mobile: boolean;
}

export const ChatPage = (props: ChatPageProps) => {
  const { accessToken, isAuthenticated } = useContext(AuthContext);

  const api = useAxios();

  const [stateGroups, setStateGroups] = useState<GroupInterface[]>([]);
  const [stateCurrUser, setStateCurrUser] = useState<CurrUserInterface>({
    avatar: "",
    id: -1,
    nickname: "",
    username: "",
    date_joined: "",
    anonymous: false,
  });
  const [stateMessages, setStateMessages] = useState<GroupMessagesInterface[]>(
    []
  );
  const [stateEncryptedMessages, setStateEncryptedMessages] = useState<
    GroupMessagesInterface[]
  >([]);
  const [stateDisplayedMessages, setStateDisplayedMessages] = useState<
    MessageInterface[]
  >([]);
  const [stateUsers, setStateUsers] = useState<UserInterface[]>([]);
  const [stateSelectedGroupId, setStateSelectedGroupId] = useState<number>(-1);
  const [stateMobileGroupId, setStateMobileGroupId] = useState<number>(-1);
  const [stateNewestMessageIndex, setStateNewestMessageIndex] =
    useState<number>(-1);
  const [stateServerId, setStateServerId] = useState<number>(1);
  const [stateSelectedGroupEncKey, setStateSelectedGroupEncKey] =
    useState<string>("");

  const [cookies] = useCookies(["chatEncryption"]);

  const navigate = useNavigate();

  const getGroupEncKey = (group_uuid: string) => {
    let curr_key = "";

    try {
      const curr_enc = cookies.chatEncryption.find(
        (grp_enc: GroupEncryptionInterface) => grp_enc.group_uuid === group_uuid
      );
      if (typeof curr_enc != "undefined") {
        curr_key = curr_enc.key;
      } else {
        console.log(
          "(Encryption) Group enc key is undefined for group:",
          group_uuid
        );
      }
    } catch (error) {
      console.log(error);
    }
    return curr_key;
  };

  const updateGroupUsers = async (group_id: number) => {
    const curr_group_data = stateGroups.find((grp) => grp.id === group_id);

    if (typeof curr_group_data != "undefined") {
      const result = await api.get(
        `/chat/groups/users/?uuid=${curr_group_data?.uuid}`
      );

      if (result.data instanceof Array && result.data.length > 0) {
        let new_users = structuredClone(stateUsers);

        result.data.forEach(function (curr_user) {
          const index = new_users.findIndex((usr) => usr.id == curr_user["id"]);

          if (index != -1) {
            new_users[index] = curr_user;
          } else {
            new_users.push(curr_user);
          }
        });

        setStateUsers(new_users);
      }
    }
  };

  const updateGroup = async (group_id: number) => {
    const curr_group_data = stateGroups.find((grp) => grp.id === group_id);

    if (typeof curr_group_data != "undefined") {
      const curr_messages = stateMessages.find(
        (message) => message.group_id === group_id
      );

      let old_len = 20;
      if (typeof curr_messages != "undefined") {
        old_len = curr_messages.messages.length;
      }

      const result = await api.get(
        `/chat/groups/?uuid=${curr_group_data.uuid}&start=0&end=${old_len}`
      );

      console.log(result);

      let new_groups = structuredClone(stateGroups);

      const index = new_groups.findIndex((grp) => grp.id == group_id);

      if (index != -1) {
        new_groups[index] = result.data.group;
        setStateGroups(new_groups);
      }

      const enc_messages_copy = structuredClone(stateEncryptedMessages);

      const index_enc_msgs = enc_messages_copy.findIndex(
        (msgs) => msgs.group_id == group_id
      );

      if (index_enc_msgs != -1) {
        enc_messages_copy[index_enc_msgs] = result.data.messages;
        setStateEncryptedMessages(enc_messages_copy);
      }

      const decrypted_messages = decryptMessagesArrayWithKey(
        result.data.messages,
        stateServerId,
        getGroupEncKey(curr_group_data.uuid)
      );

      const messages_copy = structuredClone(stateMessages);

      const index_msgs = messages_copy.findIndex(
        (msgs) => msgs.group_id == group_id
      );

      if (index_msgs != -1) {
        messages_copy[index_msgs].messages = decrypted_messages;
        if (stateSelectedGroupId == group_id) {
          setStateDisplayedMessages(decrypted_messages);
        }
        setStateMessages(messages_copy);
      }

      let new_users = structuredClone(stateUsers);

      result.data.users.forEach(function (curr_user: UserInterface) {
        const index = new_users.findIndex((usr) => usr.id == curr_user["id"]);

        if (index != -1) {
          new_users[index] = curr_user;
        } else {
          new_users.push(curr_user);
        }
      });

      setStateUsers(new_users);
    }
  };

  const handleWsMessage = (event: WebSocketEventMap["message"]) => {
    const input_data = event.data;

    const parsed_msg = JSON.parse(input_data);

    if (
      parsed_msg.hasOwnProperty("command") &&
      parsed_msg.hasOwnProperty("groupId")
    ) {
      console.log(parsed_msg);
      const curr_group_id = Number(parsed_msg["groupId"]);
      if (parsed_msg["command"] == "updateUser") {
        updateGroupUsers(curr_group_id);
      } else if (parsed_msg["command"] == "updateGroup") {
        updateGroup(curr_group_id);
      } else if (parsed_msg["command"] == "deleteGroup") {
        const curr_group_data = stateGroups.find(
          (grp) => grp.id === curr_group_id
        );

        if (typeof curr_group_data != "undefined") {
          handleGroupDeleted(curr_group_data.uuid, curr_group_data.id);
        }
      }
    } else if (
      parsed_msg.hasOwnProperty("author") &&
      parsed_msg.hasOwnProperty("created") &&
      parsed_msg.hasOwnProperty("msg") &&
      parsed_msg.hasOwnProperty("group")
    ) {
      const curr_group_id = Number(parsed_msg["group"]);

      const curr_group = stateGroups.find(
        (grp: GroupInterface) => grp.id === curr_group_id
      );

      if (typeof curr_group != "undefined") {

        const enc_messages_copy = structuredClone(stateEncryptedMessages);

        const index_enc = enc_messages_copy.findIndex(
          (msgs) => msgs.group_id == curr_group_id
        );

        if (index_enc != -1) {
          const new_msg: MessageInterface = {
            author: parsed_msg["author"],
            created: parsed_msg["created"],
            msg: parsed_msg["msg"],
          };

          enc_messages_copy[index_enc].messages = [
            ...enc_messages_copy[index_enc].messages,
            new_msg,
          ];
          setStateEncryptedMessages(enc_messages_copy);
        }

        const messages_copy = structuredClone(stateMessages);

        const index = messages_copy.findIndex(
          (msgs) => msgs.group_id == curr_group_id
        );

        const new_msg: MessageInterface = {
          author: parsed_msg["author"],
          created: parsed_msg["created"],
          msg: decrypt(parsed_msg["msg"], getGroupEncKey(curr_group.uuid)),
        };

        if (index != -1) {
          messages_copy[index].messages = [
            ...messages_copy[index].messages,
            new_msg,
          ];
          setStateMessages(messages_copy);

          if (stateSelectedGroupId == curr_group_id) {
            setStateDisplayedMessages(messages_copy[index].messages);
            setStateNewestMessageIndex(
              messages_copy[index].messages.length - 1
            );
          }
        }

        const groups_copy = structuredClone(stateGroups);

        const index_groups = groups_copy.findIndex(
          (grp) => grp.id == curr_group_id
        );

        if (index != -1) {
          groups_copy[index_groups].last_activity = new_msg.created;
          const sorted_groups = groups_copy.sort(
            (a: GroupInterface, b: GroupInterface) =>
              Date.parse(b.last_activity) - Date.parse(a.last_activity)
          );
          setStateGroups(sorted_groups);
        }
      }
    }
    return true;
  };

  const handleSendClicked = (msg: string) => {
    if (msg != "") {
      const full_msg = {
        msg: encrypt(msg, stateSelectedGroupEncKey),
        uuid: uuidv4(),
        group: stateSelectedGroupId.toString(),
      };
      sendWsMessage(JSON.stringify(full_msg));
    }
  };

  const decryptMessagesArrayWithKey = (
    messages: MessageInterface[],
    server_id: number,
    enc_key: string
  ) => {
    let output_messsages: MessageInterface[] = [];
    messages.forEach((message) => {
      let decrypted_message: MessageInterface  = {
        msg: "",
        author: message.author,
        created: message.created,
      };;
      if (message.author != server_id) {
        const decrypted_msg = decrypt(message.msg, enc_key);
        decrypted_message.msg = decrypted_msg;
      } else {
        decrypted_message = message;
      }
      output_messsages.push(decrypted_message);
    });

    return output_messsages;
  };

  const decryptGroupMessages = (
    group_messages: GroupMessagesInterface[],
    server_id: number,
    groups: GroupInterface[]
  ) => {
    let output_group_messsages: GroupMessagesInterface[] = [];
    group_messages.forEach((group_message) => {
      const curr_group = groups.find(
        (grp: GroupInterface) => grp.id === group_message.group_id
      );

      if (typeof curr_group != "undefined") {
        const decrypted_messages = decryptMessagesArrayWithKey(
          group_message.messages,
          server_id,
          getGroupEncKey(curr_group.uuid)
        );

        const decrypted_group_message: GroupMessagesInterface = {
          messages: decrypted_messages,
          group_id: group_message.group_id,
        };

        output_group_messsages.push(decrypted_group_message);
      }
    });

    return output_group_messsages;
  };

  const getGroups = async () => {
    const response = await api.get("/chat/groups/all/?start=0&end=20");

    if (response.status === 201 || response.status === 200) {
      const all_groups: AllGroupsInterface = response.data;

      const sorted_groups = all_groups.groups.sort(
        (a: GroupInterface, b: GroupInterface) =>
          Date.parse(b.last_activity) - Date.parse(a.last_activity)
      );

      const decrypted_messages = decryptGroupMessages(
        all_groups.messages,
        all_groups.server_id,
        all_groups.groups
      );

      setStateGroups(sorted_groups);
      setStateUsers(all_groups.users);
      setStateEncryptedMessages(all_groups.messages);
      setStateMessages(decrypted_messages);
      setStateCurrUser(all_groups.curr_user);
      setStateServerId(all_groups.server_id);
      if (all_groups.groups.length > 0) {
        const selected_id = all_groups.groups[0].id;
        setStateSelectedGroupId(selected_id);

        const curr_messages = decrypted_messages.find(
          (message) => message.group_id === selected_id
        )?.messages;

        if (typeof curr_messages != "undefined") {
          setStateDisplayedMessages(curr_messages);
        }
      }
    } else {
      console.log("Failed to fetch groups: ", response.data);
    }
  };

  const handleNewGroup = async (group_uuid: string, enc_key: string) => {
    try {
      const response = await api.get(
        `/chat/groups/?uuid=${group_uuid}&start=0&end=20`
      );

      if (response.status === 201 || response.status === 200) {
        const new_group: GroupInterface = response.data.group;

        const new_messages: GroupMessagesInterface = {
          messages: response.data.messages,
          group_id: new_group.id,
        };

        const new_decrypted_messages: GroupMessagesInterface = {
          messages: decryptMessagesArrayWithKey(
            response.data.messages,
            stateServerId,
            enc_key
          ),
          group_id: new_group.id,
        };

        let new_groups = [...stateGroups, new_group];
        const sorted_groups = new_groups.sort(
          (a: GroupInterface, b: GroupInterface) =>
            Date.parse(b.last_activity) - Date.parse(a.last_activity)
        );

        setStateGroups(sorted_groups);
        setStateMessages([...stateMessages, new_decrypted_messages]);
        setStateEncryptedMessages([...stateEncryptedMessages, new_messages]);
        setStateSelectedGroupId(new_group.id);
        setStateDisplayedMessages(new_decrypted_messages.messages);

        const users_copy = structuredClone(stateUsers);
        for (let i = 0; i < response.data.users.length; i++) {
          const index = stateUsers.findIndex(
            (u) => u.id == response.data.users[i].id
          );

          const new_user: UserInterface = response.data["users"][i];

          if (index != -1) {
            users_copy[index] = new_user;
          } else {
            users_copy.push(new_user);
          }
        }

        setStateUsers(users_copy);
      } else {
        console.log("Failed to get group", response.data);
      }

      getWebSocket()?.close();
    } catch (error) {
      console.log(error);
    }
  };

  const handleUserUpdated = (new_user: CurrUserInterface) => {
    setStateCurrUser(new_user);

    const users_copy = structuredClone(stateUsers);

    const new_name =
      new_user.nickname != "" ? new_user.nickname : new_user.username;

    const new_user_reduced: UserInterface = {
      id: new_user.id,
      avatar: new_user.avatar,
      date_joined: new_user.date_joined,
      name: new_name,
    };

    const index = stateUsers.findIndex((u) => u.id == new_user.id);

    if (index != -1) {
      users_copy[index] = new_user_reduced;
      setStateUsers(users_copy);
    }
  };

  const handleGroupUpdated = (new_group: GroupInterface) => {
    const groups_copy = structuredClone(stateGroups);

    const ind = groups_copy.findIndex((x) => x.id === new_group.id);
    groups_copy[ind] = new_group;
    setStateGroups(groups_copy);
  };

  const handleGroupDeleted = (uuid: string, group_id: number) => {
    const filtered_groups = stateGroups.filter((item) => item.uuid != uuid);
    setStateGroups(filtered_groups);
    setStateMessages(stateMessages.filter((item) => item.group_id != group_id));
    setStateEncryptedMessages(
      stateEncryptedMessages.filter((item) => item.group_id != group_id)
    );

    if (filtered_groups.length > 0) {
      if (stateSelectedGroupId == group_id) {
        setStateSelectedGroupId(filtered_groups[0].id);

        const curr_messages_temp = stateMessages.find(
          (message) => message.group_id === filtered_groups[0].id
        )?.messages;

        if (typeof curr_messages_temp != "undefined") {
          setStateDisplayedMessages(curr_messages_temp);
        } else {
          setStateDisplayedMessages([]);
        }
      }
    } else {
      setStateSelectedGroupId(-1);
      setStateDisplayedMessages([]);
    }
  };

  const handleGroupSelected = (group_id: number) => {
    setStateSelectedGroupId(group_id);
    setStateMobileGroupId(group_id);
    const curr_messages = stateMessages.find(
      (message) => message.group_id === group_id
    )?.messages;

    if (typeof curr_messages != "undefined") {
      setStateDisplayedMessages(curr_messages);
    }
  };

  const handleMobileBackClicked = () => {
    setStateMobileGroupId(-1);
  };

  const handleLoadOlderMessages = async (group_id: number, start: number) => {
    const curr_group_data = stateGroups.find((grp) => grp.id === group_id);

    if (typeof curr_group_data != "undefined") {
      const resp = await api.get(
        `chat/groups/messages/?start=${start}&end=${start + 10}&groupUuid=${
          curr_group_data?.uuid
        }`
      );

      const messages_copy = structuredClone(stateMessages);
      const enc_messages_copy = structuredClone(stateEncryptedMessages);

      const decrypted_messages = decryptMessagesArrayWithKey(
        resp.data["messages"],
        stateServerId,
        getGroupEncKey(curr_group_data.uuid)
      );

      const index_enc = enc_messages_copy.findIndex(
        (msgs) => msgs.group_id == group_id
      );

      if (index_enc != -1) {
        enc_messages_copy[index_enc].messages = [
          ...resp.data["messages"],
          ...enc_messages_copy[index_enc].messages,
        ];
        setStateEncryptedMessages(enc_messages_copy);
      }

      const index = messages_copy.findIndex(
        (msgs) => msgs.group_id == group_id
      );

      if (index != -1) {
        messages_copy[index].messages = [
          ...decrypted_messages,
          ...messages_copy[index].messages,
        ];
        setStateMessages(messages_copy);

        if (stateSelectedGroupId == group_id) {
          setStateDisplayedMessages(messages_copy[index].messages);
        }
      }
    }
  };

  const handleEncryptionKeyUpdated = (enc_key: string, group_id: number) => {

    if (stateSelectedGroupId == group_id) {
      setStateSelectedGroupEncKey(enc_key);
    }

    const index_enc = stateEncryptedMessages.findIndex(
      (msgs) => msgs.group_id == group_id
    );


    if (index_enc != -1) {
      const decrypted_messages = decryptMessagesArrayWithKey(
        stateEncryptedMessages[index_enc].messages,
        stateServerId,
        enc_key
      );

      const messages_copy = structuredClone(stateMessages);

      const index = messages_copy.findIndex(
        (msgs) => msgs.group_id == group_id
      );

      if (index != -1) {
        messages_copy[index].messages = decrypted_messages;
        setStateMessages(messages_copy);

        if (stateSelectedGroupId == group_id) {
          setStateDisplayedMessages(messages_copy[index].messages);
        }
      }
    }
  };

  const handleReloadEncryption = (new_enc: GroupEncryptionInterface[]) => {
    const messages_copy = structuredClone(stateMessages);

    for (let enc of new_enc) {
      const curr_group = stateGroups.find((grp) => grp.uuid == enc.group_uuid);

      if (typeof curr_group != "undefined") {
        const index_enc = stateEncryptedMessages.findIndex(
          (msgs) => msgs.group_id == curr_group.id
        );

        const index = messages_copy.findIndex(
          (msgs) => msgs.group_id == curr_group.id
        );

        if (index_enc != -1 && index != -1) {
          const decrypted_messages = decryptMessagesArrayWithKey(
            stateEncryptedMessages[index_enc].messages,
            stateServerId,
            enc.key
          );

          messages_copy[index].messages = decrypted_messages;

          if (stateSelectedGroupId == curr_group.id) {
            setStateDisplayedMessages(messages_copy[index].messages);
          }
        }
      }
      setStateMessages(messages_copy);
    }
  };

  useEffect(() => {
    const startup = async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        navigate("/");
        return;
      }
      await getGroups();
    };
    startup();
  }, []);

  useEffect(() => {
    const curr_group = stateGroups.find(
      (grp: GroupInterface) => grp.id === stateSelectedGroupId
    );

    if (typeof curr_group != "undefined") {
      setStateSelectedGroupEncKey(getGroupEncKey(curr_group.uuid));
    }
  }, [stateSelectedGroupId, stateGroups]);

  const checkIn = async () => {
    await api.get("user/checkIn/");
  };

  useEffect(() => {
    checkIn();
    const interval = setInterval(() => {
      checkIn();
    }, 300000);

    return () => clearInterval(interval);
  }, [accessToken]);

  const { sendMessage, readyState, getWebSocket } = useWebSocket(
    `${WsUrl}?token=${accessToken}`,
    {
      onOpen: () => console.log("WS opened"),
      onClose: () => console.log("WS closed"),
      onMessage: handleWsMessage,
      shouldReconnect: () => true,
      reconnectAttempts: 1000,
      reconnectInterval: 1000,
      heartbeat: {
        message: '{"command": "ping"}',
        returnMessage: '{"command": "pong"}',
        timeout: 20000,
        interval: 5000,
      },
    }
  );

  const sendWsMessage = (msg: string) => {
    if (readyState == ReadyState.OPEN) sendMessage(msg);
  };

  if (props.is_mobile) {
    if (stateMobileGroupId == -1) {
      return (
        <div className="chatMobile">
          <GroupComponent
            is_mobile={true}
            onNewGroupCreated={handleNewGroup}
            onUserUpdated={handleUserUpdated}
            users={stateUsers}
            groups={stateGroups}
            messages={stateMessages}
            curr_user={stateCurrUser}
            selected_group={stateSelectedGroupId}
            onGroupSelected={handleGroupSelected}
            onGroupUpdated={handleGroupUpdated}
            onGroupDeleted={handleGroupDeleted}
            onEncryptionKeyUpdated={handleEncryptionKeyUpdated}
            onReloadEncryption={handleReloadEncryption}
          ></GroupComponent>
        </div>
      );
    } else {
      return (
        <div className="chatMobile">
          <ChatComponent
            is_mobile={true}
            onSendClicked={handleSendClicked}
            messages={stateDisplayedMessages}
            groups={stateGroups}
            user_id={stateCurrUser.id}
            curr_group_id={stateSelectedGroupId}
            users={stateUsers}
            server_id={stateServerId}
            newest_msg_index={stateNewestMessageIndex}
            onLoadOlderMessages={handleLoadOlderMessages}
            onResetNewestMessageIndex={() => {
              setStateNewestMessageIndex(-1);
            }}
            onMobileBackClicked={handleMobileBackClicked}
          ></ChatComponent>
        </div>
      );
    }
  } else {
    return (
      <>
        <div className="chatGrid">
          <GroupComponent
            is_mobile={false}
            onNewGroupCreated={handleNewGroup}
            onUserUpdated={handleUserUpdated}
            users={stateUsers}
            groups={stateGroups}
            messages={stateMessages}
            curr_user={stateCurrUser}
            selected_group={stateSelectedGroupId}
            onGroupSelected={handleGroupSelected}
            onGroupUpdated={handleGroupUpdated}
            onGroupDeleted={handleGroupDeleted}
            onEncryptionKeyUpdated={handleEncryptionKeyUpdated}
            onReloadEncryption={handleReloadEncryption}
          ></GroupComponent>
          <ChatComponent
            onSendClicked={handleSendClicked}
            is_mobile={false}
            messages={stateDisplayedMessages}
            groups={stateGroups}
            user_id={stateCurrUser.id}
            curr_group_id={stateSelectedGroupId}
            users={stateUsers}
            server_id={stateServerId}
            newest_msg_index={stateNewestMessageIndex}
            onLoadOlderMessages={handleLoadOlderMessages}
            onMobileBackClicked={handleMobileBackClicked}
            onResetNewestMessageIndex={() => {
              setStateNewestMessageIndex(-1);
            }}
          ></ChatComponent>
        </div>
      </>
    );
  }
};
