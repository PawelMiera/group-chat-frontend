import "./GroupElement.css";
import SettingsIcon from "../../assets/icons/settings_icon.svg";

interface GroupElementProps {
  group_name: string;
  last_message: string;
  last_author: string | undefined;
  is_selected: boolean;
  id: string;
  avatar: string;
  on_click: (arg: string) => void;
  on_settings_click: (arg: string) => void;
}

const GroupElement = (props: GroupElementProps) => {
  let message_text = "";
  if (props.last_author != null && props.last_author != "") {
    message_text = props.last_author + ": " + props.last_message;
  }

  return (
    <div
      className={props.is_selected ? "groupElement selected" : "groupElement"}
      onClick={() => props.on_click(props.id)}
    >
      <img
        src={props.avatar}
        className="groupAvatar"
      />
      <div className="groupText text-truncate">
        <div className="groupName text-truncate">{props.group_name}</div>
        <div className="groupText text-truncate">{message_text}</div>
        
      </div>
      <img
        src={SettingsIcon}
        alt="Settings icon"
        className="settingsIcon"
        width={30}
        onClick={() => props.on_settings_click(props.id)}
      />
    </div>
  );
};

export default GroupElement;
