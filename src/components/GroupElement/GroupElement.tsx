import "./GroupElement.css";
import SettingsIcon from '../../assets/icons/settings_icon.svg';

interface GroupElementProps {
    group_name: string;
    last_message: string;
    last_author: string | undefined;
    is_selected: boolean;
    id: string;
    on_click: (arg: string) => void;
  }

const GroupElement = (props: GroupElementProps) => {
    let group_name = props.group_name;
    let message_text = "";
    if (props.last_author != null && props.last_author != "")
    {
        message_text = props.last_author + ": " + props.last_message;
    }

    return (
        <div className={ props.is_selected ? "groupElement selected": "groupElement"} onClick={() => props.on_click(props.id)}>
            <div className="groupText">
                <div className="groupName">
                    {group_name}
                </div>
                {message_text}
            </div>
                <img src={SettingsIcon} alt="Settings icon" className="settingsIcon" width={30}/>
        </div>
    )
}

export default GroupElement;
