import { Button } from "react-bootstrap";
import { ChatMessageInterface } from "../../common/types.tsx";
import ChatBubble from "../ChatBubble/ChatBubble.tsx";
import "./ChatComponent.css";
import { useRef, useState } from "react";
import useAutosizeTextArea from "./useAutosizeTextArea";

interface ChatComponentProps {
  messages: ChatMessageInterface[];
  username: string;
}

const ChatComponent = (props: ChatComponentProps) => {
  const [message, setMessage] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextArea(textAreaRef.current, message);

  const handleChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = evt.target?.value;

    setMessage(val);
  };

  return (
    <>
      <div className="chatComponentContainer">
        <div className="chatContainer">
          {props.messages.map((item, index) => (
            <ChatBubble
              is_curr_user={props.username == item.user}
              message_time={item.time}
              key={index}
            >
              {item.message}
            </ChatBubble>
          ))}
        </div>
        <div className="sendMessageDiv">
          <textarea
            className="form-control shadow-none"
            id="message-text"
            onChange={handleChange}
            ref={textAreaRef}
            rows={1}
            placeholder="Your Message"
          ></textarea>
          <Button className="defaultAppColor">Send</Button>
        </div>
      </div>
    </>
  );
};

export default ChatComponent;
