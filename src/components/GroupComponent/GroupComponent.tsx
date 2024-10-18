import { Button } from "react-bootstrap";
import { GroupInterface, UserInterface, MessageInterface } from "../../common/types.tsx";
import "./GroupComponent.css";
import SettingsIcon from "../../assets/icons/settings_icon.svg";
import GroupElement from "../GroupElement/GroupElement";
import { useState } from "react";
import { NewGroupModal } from "../NewGroupModal/NewGroupModal.tsx";

interface GroupComponentProps {
  groups: GroupInterface[];
  users:  UserInterface[];
  selected_group: string;
  onGroupSelected: (arg: string) => void;
}

const ChatComponent = (props: GroupComponentProps) => {
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [_, setShowJoinGroupModal] = useState(false);

  return (
    <>
    <NewGroupModal handleClosed={()=>{setShowNewGroupModal(false)}} show={showNewGroupModal}></NewGroupModal>
      <div className="leftContainer">
        <div className="settingsDiv">
          <Button className="defaultAppColor" onClick={() => {setShowJoinGroupModal(false); setShowNewGroupModal(true)}}>New group</Button>
          <Button className="defaultAppColor" onClick={() => {setShowJoinGroupModal(true); setShowNewGroupModal(false)}}>Join group</Button>
          <img
            src={SettingsIcon}
            alt="Settings icon"
            className="accountSettingsIcon"
            width={40}
          />
        </div>
        <div className="groupContainer">
          {
            props.groups.map((value, index) => 
                <GroupElement id={value.id} on_click={() =>{props.onGroupSelected(value.id)}} key={index} group_name={value.name} last_message={value.last_msg.msg} last_author={props.users.find((user) => user.id === value.last_msg.author)?.name} is_selected={props.selected_group==value.id}></GroupElement>
              )
          }
        </div>
      </div>
    </>
  );
};

export default ChatComponent;
