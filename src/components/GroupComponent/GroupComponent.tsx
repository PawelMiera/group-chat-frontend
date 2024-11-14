import { Button } from "react-bootstrap";
import {
  GroupInterface,
  UserInterface,
  CurrUserInterface,
} from "../../common/types.tsx";
import "./GroupComponent.css";
import GroupElement from "../GroupElement/GroupElement";
import { useState } from "react";
import { NewGroupModal } from "../NewGroupModal/NewGroupModal.tsx";
import { JoinGroupModal } from "../JoinGroupModal/JoinGroupModal.tsx";
import { UserModal } from "../UserModal/UserModal.tsx";
import { GroupModal } from "../GroupModal/GroupModal.tsx";

interface GroupComponentProps {
  groups: GroupInterface[];
  users: UserInterface[];
  curr_user: CurrUserInterface;
  selected_group: string;
  onGroupSelected: (arg: string) => void;
  onNewGroupCreated: (group_uuid: string) => void;
  onUserUpdated: (new_user: CurrUserInterface) => void;
  onGroupUpdated: (new_group: GroupInterface) => void;
  onGroupDeleted: (uuid: string, id: string) => void;
}

const ChatComponent = (props: GroupComponentProps) => {
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showJoinGroupModal, setShowJoinGroupModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [settingsGroup, setSettingsGroup] = useState<GroupInterface>({
    avatar: "",
    id: "-1",
    name: "",
    uuid: "",
    members: [],
    last_msg: {
      author: "",
      msg: "",
      created: "",
    },
  });

  const handleSettingsGroupClicked = (group_id: string) => {
    const selected_group = props.groups.find((grp) => grp.id === group_id)
    if (typeof(selected_group) != "undefined")
    {
      setSettingsGroup(selected_group);
      setShowGroupModal(true);
    }
  };

  const handleGroupUpdated = (new_group : GroupInterface) => {
      setSettingsGroup(new_group);
      props.onGroupUpdated(new_group)
  }

  return (
    <>
      <NewGroupModal
        newGroupCreated={props.onNewGroupCreated}
        handleClosed={() => {
          setShowNewGroupModal(false);
        }}
        show={showNewGroupModal}
      ></NewGroupModal>
      <JoinGroupModal
        newGroupJoined={props.onNewGroupCreated}
        handleClosed={() => {
          setShowJoinGroupModal(false);
        }}
        show={showJoinGroupModal}
      ></JoinGroupModal>
      <UserModal
        user={props.curr_user}
        show={showUserModal}
        userUpdated={props.onUserUpdated}
        handleClosed={() => {
          setShowUserModal(false);
        }}
      ></UserModal>
      <GroupModal
        group={settingsGroup}
        show={showGroupModal}
        onGroupUpdated={handleGroupUpdated}
        onGroupDeleted={props.onGroupDeleted}
        handleClosed={() => {
          setShowGroupModal(false);
        }}
      ></GroupModal>
      <div className="leftContainer">
        <div className="settingsDiv align-items-center mb-2">
          <div>
            <Button
              className="defaultAppColor"
              onClick={() => {
                setShowNewGroupModal(true);
              }}
            >
              New group
            </Button>
          </div>
          <div>

            <Button
              className="defaultAppColor"
              onClick={() => {
                setShowJoinGroupModal(true);
              }}
            >
              Join group
            </Button>
          </div>

          <img
            src={props.curr_user.avatar}
            alt="Settings icon"
            className="accountSettingsIcon"
            onClick={() => {
              setShowUserModal(true);
            }}
          />
        </div>
        <div className="groupContainer">
          {props.groups.map((value, index) => (
            <GroupElement
              id={value.id}
              on_click={() => {
                props.onGroupSelected(value.id);
              }}
              key={index}
              group_name={value.name}
              avatar={value.avatar}
              last_message={value.last_msg.msg}
              last_author={
                props.users.find((user) => user.id === value.last_msg.author)
                  ?.name
              }
              is_selected={props.selected_group == value.id}
              on_settings_click={handleSettingsGroupClicked}
            ></GroupElement>
          ))}
        </div>
      </div>
    </>
  );
};

export default ChatComponent;
