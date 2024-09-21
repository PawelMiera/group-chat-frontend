import "./GroupElement.css";
import SettingsIcon from '../../assets/icons/settings_icon.svg';

interface GroupElementProps {
    group_name: string;
    last_message: string;
    last_user: string;
    is_selected: boolean;
  }

const GroupElement = (props: GroupElementProps) => {
    let last_message = props.last_message;
    let group_name = props.group_name;

    return (
        <div className={ props.is_selected ? "groupElement selected": "groupElement"}>
            <div className="groupText">
                <div className="groupName">
                    {group_name}
                </div>
                {props.last_user + ": " + last_message}
            </div>
                <img src={SettingsIcon} alt="Settings icon" className="settingsIcon" width={30}/>
        </div>
    )
}

export default GroupElement;
