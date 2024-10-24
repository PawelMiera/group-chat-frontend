import { Button } from "react-bootstrap";
import { GroupInterface, UserInterface, CurrUserInterface } from "../../common/types.tsx";
import "./GroupComponent.css";
import GroupElement from "../GroupElement/GroupElement";
import { useState } from "react";
import { NewGroupModal } from "../NewGroupModal/NewGroupModal.tsx";
import { JoinGroupModal } from "../JoinGroupModal/JoinGroupModal.tsx";
import { UserModal } from "../UserModal/UserModal.tsx";

interface GroupComponentProps {
  groups: GroupInterface[];
  users:  UserInterface[];
  curr_user: CurrUserInterface;
  selected_group: string;
  onGroupSelected: (arg: string) => void;
  newGroupCreated: (group_id: string) => void;
  userUpdated: (new_user: CurrUserInterface ) => void;
}

const ChatComponent = (props: GroupComponentProps) => {
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showJoinGroupModal, setShowJoinGroupModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);


  return (
    <>
    <NewGroupModal newGroupCreated={props.newGroupCreated} handleClosed={()=>{setShowNewGroupModal(false)}} show={showNewGroupModal}></NewGroupModal>
    <JoinGroupModal newGroupJoined={props.newGroupCreated} handleClosed={()=>{setShowJoinGroupModal(false)}} show={showJoinGroupModal}></JoinGroupModal>
    <UserModal user={props.curr_user} show={showUserModal} userUpdated={props.userUpdated} handleClosed={() =>{setShowUserModal(false)}}></UserModal>
      <div className="leftContainer">
        <div className="settingsDiv">
          <Button className="defaultAppColor" onClick={() => {setShowJoinGroupModal(false); setShowNewGroupModal(true)}}>New group</Button>
          <Button className="defaultAppColor" onClick={() => {setShowJoinGroupModal(true); setShowNewGroupModal(false)}}>Join group</Button>
          <img
            src={props.curr_user.avatar}
            alt="Settings icon"
            className="accountSettingsIcon"
            onClick={()=>{setShowUserModal(true)}}
          />
        </div>
        <div className="groupContainer">
          {
            props.groups.map((value, index) => 
                <GroupElement id={value.id} on_click={() =>{props.onGroupSelected(value.id)}} key={index} group_name={value.name} avatar={value.avatar} last_message={value.last_msg.msg} last_author={props.users.find((user) => user.id === value.last_msg.author)?.name} is_selected={props.selected_group==value.id}></GroupElement>
              )
          }
        </div>
      </div>
    </>
  );
};

export default ChatComponent;
