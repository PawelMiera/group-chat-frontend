import { Button } from "react-bootstrap";
import { MessageInterface } from "../../common/types.tsx";
import ChatBubble from "../ChatBubble/ChatBubble.tsx";
import "./ChatComponent.css";
import { useEffect, useRef, useState } from "react";
import useAutosizeTextArea from "./useAutosizeTextArea";

interface ChatComponentProps {
  messages: MessageInterface[];
  user_id: string;
  onSendClicked: (msg: string) => void;
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
    const { scrollHeight } = container.current as HTMLDivElement
    container.current?.scrollTo(0, scrollHeight)
  }

  useEffect(() => {
    Scroll()
  }, [props.messages])


  return (
    <>
      <div className="chatComponentContainer">
        <div className="chatContainer" id="chat-feed" ref={container}>
          {props.messages.map((item, index) => (
            <ChatBubble
              is_curr_user={props.user_id == item.author}
              message_time={item.created}
              key={"b"+index}
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
