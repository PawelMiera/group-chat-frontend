import "./ChatBubble.css";

interface ChatBubbleProps {
    children: string;
    is_curr_user: boolean;
    message_time: string;
  }

const ChatBubble = (props: ChatBubbleProps) => {

    if (props.is_curr_user)
    {
        return (
            <div className="bubble you" title={props.message_time}>
            {props.children}
            </div>
        )
    }
    else
    {
        return (
            <div className="bubble others" title={props.message_time}>
            {props.children}
            </div>
        )
    }


}

export default ChatBubble;
