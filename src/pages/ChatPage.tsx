// import NavBar from "../components/NavBar";
import ChatComponent from "../components/ChatComponent/ChatComponent";
import {ChatMessageInterface, GroupInterface} from "../common/types"
import "./ChatPage.css";
import GroupComponent from "../components/GroupComponent/GroupComponent";

export const ChatPage = () => {

  const messages : ChatMessageInterface[] = []
  let msg: ChatMessageInterface = {
    message: 'hejka',
    user: 'pawel',
    time: '22.12.2024 17:55',
};
  messages.push(msg)
  let msg2 = structuredClone(msg);
  msg2.user = "marek"
  msg2.message = "hej tu marek"
  messages.push(msg)
  messages.push(msg2)
  messages.push(msg)
  messages.push(msg2)
  messages.push(msg)
  messages.push(msg2)
  messages.push(msg2)
  messages.push(msg2)
  messages.push(msg2)
  messages.push(msg2)
  messages.push(msg2)
  messages.push(msg2)
  messages.push(msg2)
  messages.push(msg2)
  messages.push(msg2)
  messages.push(msg2)
  messages.push(msg2)


  const groups : GroupInterface[] = []
  let grp: GroupInterface = {
    name:"Rybactwo",
    last_message: "dsadsasad",
    last_user: "pawel",
  };


  groups.push(grp);
  groups.push(grp);
  groups.push(grp);
  let grp2 = structuredClone(grp);
  grp2.name = "Mojo Dojo";
  grp2.last_message= "Casa Home";
  grp2.last_user="Ken";
  groups.push(grp2);
  groups.push(grp2);

  return (
    <>
      <div className="chatGrid">
        <GroupComponent groups={groups} selected_group={0}></GroupComponent>
        <ChatComponent messages={messages} username="pawel"></ChatComponent>

      </div>
    </>
  );
};
