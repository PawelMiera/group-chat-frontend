import "./GroupElement.css";
import SettingsIcon from "../../assets/icons/settings_icon.svg";

interface GroupElementProps {
  group_name: string;
  last_message: string;
  last_author: string | undefined;
  is_selected: boolean;
  is_mobile: boolean;
  id: number;
  avatar: string;
  on_click: (arg: number) => void;
  on_settings_click: (arg: number) => void;
}

const GroupElement = (props: GroupElementProps) => {
  let message_text = "";
  if (props.last_author != null && props.last_author != "") {
    const author_reduced = props.last_author.length > 10 ? props.last_author.substring(0,10) + "... " : props.last_author;
    message_text = author_reduced + ": " + props.last_message;
  }

  const settingsClicked = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.on_settings_click(props.id);
  }

  return (
    <div
      className={props.is_selected && !props.is_mobile ? "groupElement selected" : "groupElement"}
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
        className={props.is_mobile ? "settingsIconMobile" : "settingsIcon"}
        width={30}
        onClick={settingsClicked}
      />
    </div>
  );
};

export default GroupElement;
