// import NavBar from "../components/NavBar";
import { Button } from "react-bootstrap";
import ChatComponent from "../components/ChatComponent/ChatComponent";
import GroupElement from "../components/GroupElement/GroupElement";
import {ChatMessageInterface} from "../common/types"
import "./ChatPage.css";
import SettingsIcon from '../assets/icons/settings_icon.svg';

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


  return (
    <>
      <div className="chatGrid">
        <div className="leftContainer">
          <div className="settingsDiv">
            <Button className="defaultAppColor">New group</Button>
            <Button className="defaultAppColor">Join group</Button>
            <img src={SettingsIcon} alt="Settings icon" className="accountSettingsIcon" width={40}/>
          </div>
          <div className="groupContainer">
            <GroupElement is_selected={false} group_name="Moj Dom" last_user="Pawel Miera" last_message="ale bekaaaaa dsfsfsfsfsfsfsfsfsfsfsf  fdsssssssssssf fdsdfs              sdfsdfsdf"></GroupElement>
            <GroupElement is_selected={true} group_name="Mojo Dojo Cassa Home" last_user="Pawel Miera" last_message="ale bekaaaaa dsfsfsfsfsfsfsfsfsfsfsf  fdsssssssssssf fdsdfs              sdfsdfsdf"></GroupElement>
            <GroupElement is_selected={false} group_name="Rybactwo" last_user="Pawel Miera" last_message="ale bekaaaaa dsfsfsfsfsfsfsfsfsfsfsf  fdsssssssssssf fdsdfs              sdfsdfsdf"></GroupElement>
            <GroupElement is_selected={false} group_name="Rybactwo" last_user="Pawel Miera" last_message="ale bekaaaaa dsfsfsfsfsfsfsfsfsfsfsf  fdsssssssssssf fdsdfs              sdfsdfsdf"></GroupElement>
            <GroupElement is_selected={false} group_name="Rybactwo" last_user="Pawel Miera" last_message="ale bekaaaaa dsfsfsfsfsfsfsfsfsfsfsf  fdsssssssssssf fdsdfs              sdfsdfsdf"></GroupElement>
            <GroupElement is_selected={false} group_name="Rybactwo" last_user="Pawel Miera" last_message="ale bekaaaaa dsfsfsfsfsfsfsfsfsfsfsf  fdsssssssssssf fdsdfs              sdfsdfsdf"></GroupElement>
            <GroupElement is_selected={false} group_name="Rybactwo" last_user="Pawel Miera" last_message="ale bekaaaaa dsfsfsfsfsfsfsfsfsfsfsf  fdsssssssssssf fdsdfs              sdfsdfsdf"></GroupElement>
            <GroupElement is_selected={false} group_name="Rybactwo" last_user="Pawel Miera" last_message="ale bekaaaaa dsfsfsfsfsfsfsfsfsfsfsf  fdsssssssssssf fdsdfs              sdfsdfsdf"></GroupElement>
            <GroupElement is_selected={false} group_name="Rybactwo" last_user="Pawel Miera" last_message="ale bekaaaaa dsfsfsfsfsfsfsfsfsfsfsf  fdsssssssssssf fdsdfs              sdfsdfsdf"></GroupElement>
            <GroupElement is_selected={false} group_name="Rybactwo" last_user="Pawel Miera" last_message="ale bekaaaaa dsfsfsfsfsfsfsfsfsfsfsf  fdsssssssssssf fdsdfs              sdfsdfsdf"></GroupElement>
            <GroupElement is_selected={false} group_name="Rybactwo" last_user="Pawel Miera" last_message="ale bekaaaaa dsfsfsfsfsfsfsfsfsfsfsf  fdsssssssssssf fdsdfs              sdfsdfsdf"></GroupElement>
            <GroupElement is_selected={false} group_name="Rybactwo" last_user="Pawel Miera" last_message="ale bekaaaaa dsfsfsfsfsfsfsfsfsfsfsf  fdsssssssssssf fdsdfs              sdfsdfsdf"></GroupElement>
            <GroupElement is_selected={false} group_name="Rybactwo" last_user="Pawel Miera" last_message="ale bekaaaaa dsfsfsfsfsfsfsfsfsfsfsf  fdsssssssssssf fdsdfs              sdfsdfsdf"></GroupElement>
            <GroupElement is_selected={false} group_name="Rybactwo" last_user="Pawel Miera" last_message="ale bekaaaaa dsfsfsfsfsfsfsfsfsfsfsf  fdsssssssssssf fdsdfs              sdfsdfsdf"></GroupElement>
            <GroupElement is_selected={false} group_name="Rybactwo" last_user="Pawel Miera" last_message="ale bekaaaaa dsfsfsfsfsfsfsfsfsfsfsf  fdsssssssssssf fdsdfs              sdfsdfsdf"></GroupElement>
          </div>
        </div>
        <ChatComponent messages={messages} username="pawel"></ChatComponent>

      </div>
    </>
  );
};
