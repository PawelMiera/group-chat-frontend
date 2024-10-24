import { Button } from "react-bootstrap";
import { MessageInterface, UserInterface, GroupInterface} from "../../common/types.tsx";
import ChatBubble from "../ChatBubble/ChatBubble.tsx";
import "./ChatComponent.css";
import { useEffect, useRef, useState } from "react";
import useAutosizeTextArea from "./useAutosizeTextArea";

interface ChatComponentProps {
  messages: MessageInterface[];
  user_id: string;
  curr_group_id: string;
  newest_msg_index: number;
  users: UserInterface[];
  onSendClicked: (msg: string) => void;
  onResetNewestMessageIndex: () => void;
}


const ChatComponent = (props: ChatComponentProps) => {
  const [message, setMessage] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextArea(textAreaRef.current, message);

  const handleChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = evt.target?.value;
    setMessage(val);
  };

  const clearAndSend = () => {
    const temp = message;
    setMessage("");
    props.onSendClicked(temp);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey)
    {
      e.preventDefault();
      clearAndSend();
    }
  }

  const container = useRef<HTMLDivElement>(null)

  const Scroll = () => {
    const { offsetHeight, scrollHeight, scrollTop } = container.current as HTMLDivElement

    if(props.messages.length > 0 && props.messages[props.messages.length - 1].author == props.user_id)
    {
      container.current?.scrollTo(0, scrollHeight)
    }
    else if (scrollHeight - offsetHeight - scrollTop < 700){
      container.current?.scrollTo(0, scrollHeight)
    }
  }


  useEffect(() => {
      Scroll();
  }, [props.messages])


  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      props.onResetNewestMessageIndex();
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [props.newest_msg_index]);

  return (
    <>
      <div className="chatComponentContainer">
        <div className="chatContainer" id="chat-feed" ref={container}>
          {props.messages.map((item, index) => (
            <ChatBubble
              name={item.author}
              avatar={props.users.find((us) => us.id == item.author)?.avatar}
              is_curr_user={props.user_id == item.author}
              message_time={item.created}
              key={props.curr_group_id + "msg" + index}
              start_animation={props.newest_msg_index != -1 && props.newest_msg_index == index}
            >
              {item.msg}
            </ChatBubble>
          ))}

        </div>
        <div className="sendMessageDiv">
          <textarea
            className="form-control shadow-none"
            id="message-text"
            onChange={handleChange}
            ref={textAreaRef}
            value={message}
            rows={1}
            placeholder="Your Message"
            onKeyDown={handleKeyDown}
          ></textarea>
          <div className="mt-auto">
            <Button className="defaultAppColor" onClick={clearAndSend}>Send</Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatComponent;
