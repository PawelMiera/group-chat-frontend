import { Button } from "react-bootstrap";
import {
  GroupInterface,
  UserInterface,
  CurrUserInterface,
  GroupMessagesInterface,
  MessageInterface,
  GroupEncryptionInterface,
} from "../../common/types.tsx";
import "./GroupComponent.css";
import GroupElement from "../GroupElement/GroupElement";
import { useEffect, useState } from "react";
import { NewGroupModal } from "../NewGroupModal/NewGroupModal.tsx";
import { JoinGroupModal } from "../JoinGroupModal/JoinGroupModal.tsx";
import { UserModal } from "../UserModal/UserModal.tsx";
import { GroupModal } from "../GroupModal/GroupModal.tsx";

interface GroupComponentProps {
  is_mobile: boolean;
  groups: GroupInterface[];
  messages: GroupMessagesInterface[];
  users: UserInterface[];
  curr_user: CurrUserInterface;
  selected_group: number;
  onGroupSelected: (group_id: number) => void;
  onNewGroupCreated: (group_uuid: string, enc_key: string) => void;
  onUserUpdated: (new_user: CurrUserInterface) => void;
  onGroupUpdated: (new_group: GroupInterface) => void;
  onGroupDeleted: (uuid: string, group_id: number) => void;
  onEncryptionKeyUpdated: (enc_key: string, group_id: number) => void;
  onReloadEncryption: (new_enc: GroupEncryptionInterface[]) => void;
}

const ChatComponent = (props: GroupComponentProps) => {
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showJoinGroupModal, setShowJoinGroupModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [settingsGroup, setSettingsGroup] = useState<GroupInterface>(
    {} as GroupInterface
  );
  const [groupToJoin, setGroupToJoin] = useState("");

  const handleSettingsGroupClicked = (group_id: number) => {
    const selected_group = props.groups.find((grp) => grp.id === group_id);
    if (typeof selected_group != "undefined") {
      setSettingsGroup(selected_group);
      setShowGroupModal(true);
    }
  };

  const handleGroupUpdated = (new_group: GroupInterface) => {
    setSettingsGroup(new_group);
    props.onGroupUpdated(new_group);
  };

  let group_elements = [];
  for (let group of props.groups) {
    let last_msg: MessageInterface = { author: -1, msg: "", created: "" };
    const curr_msgs = props.messages.find(
      (msg: GroupMessagesInterface) => msg.group_id === group.id
    );
    if (typeof curr_msgs != "undefined" && curr_msgs.messages.length > 0) {
      last_msg = curr_msgs.messages[curr_msgs.messages.length - 1];
    }

    group_elements.push(
      <GroupElement
        is_mobile={props.is_mobile}
        id={group.id}
        on_click={() => {
          props.onGroupSelected(group.id);
        }}
        key={group.id}
        group_name={group.name}
        avatar={group.avatar}
        last_message={last_msg.msg}
        last_author={
          props.users.find((user) => user.id === last_msg.author)?.name
        }
        is_selected={props.selected_group == group.id}
        on_settings_click={handleSettingsGroupClicked}
      ></GroupElement>
    );
  }

  useEffect(() => {
    const group_to_join_ls = localStorage.getItem("joinGroup");
    if (group_to_join_ls != null && group_to_join_ls != "") {
      setGroupToJoin(group_to_join_ls);
      setShowJoinGroupModal(true);
    } else {
      localStorage.removeItem("joinGroup");
    }
  }, []);

  return (
    <>
      <NewGroupModal
        is_mobile={props.is_mobile}
        newGroupCreated={props.onNewGroupCreated}
        handleClosed={() => {
          setShowNewGroupModal(false);
        }}
        show={showNewGroupModal}
      ></NewGroupModal>
      <JoinGroupModal
        is_mobile={props.is_mobile}
        newGroupJoined={props.onNewGroupCreated}
        groupToJoin={groupToJoin}
        handleClosed={() => {
          setShowJoinGroupModal(false);
        }}
        show={showJoinGroupModal}
      ></JoinGroupModal>
      <UserModal
        is_mobile={props.is_mobile}
        user={props.curr_user}
        show={showUserModal}
        userUpdated={props.onUserUpdated}
        handleClosed={() => {
          setShowUserModal(false);
        }}
        onReloadEncryption={props.onReloadEncryption}
      ></UserModal>
      <GroupModal
        group={settingsGroup}
        show={showGroupModal}
        is_mobile={props.is_mobile}
        onGroupUpdated={handleGroupUpdated}
        onGroupDeleted={props.onGroupDeleted}
        onEncryptionKeyUpdated={props.onEncryptionKeyUpdated}
        handleClosed={() => {
          setShowGroupModal(false);
        }}
      ></GroupModal>
      <div
        className={props.is_mobile ? "leftContainerMobile" : "leftContainer"}
      >
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
        <div className="groupContainer">{group_elements}</div>
      </div>
    </>
  );
};

export default ChatComponent;
