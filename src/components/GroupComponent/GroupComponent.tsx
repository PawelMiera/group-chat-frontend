import { Button } from "react-bootstrap";
import { GroupInterface } from "../../common/types.tsx";
import "./GroupComponent.css";
import SettingsIcon from "../../assets/icons/settings_icon.svg";
import GroupElement from "../GroupElement/GroupElement";
import { useState } from "react";
import { NewGroupModal } from "../NewGroupModal/NewGroupModal.tsx";

interface GroupComponentProps {
  groups: GroupInterface[];
  selected_group: number;
}

const ChatComponent = (props: GroupComponentProps) => {
  const [selectedGroup] = useState(props.selected_group);
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
          {props.groups.map((item, index) => (
            <GroupElement key={index} group_name={item.name} last_user={item.last_user} last_message={item.last_message} is_selected={selectedGroup==index}></GroupElement>
          ))}
        </div>
      </div>
    </>
  );
};

export default ChatComponent;
