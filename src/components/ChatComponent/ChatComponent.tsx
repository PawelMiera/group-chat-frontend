import { Button } from "react-bootstrap";
import {
  MessageInterface,
  UserInterface,
  GroupInterface,
} from "../../common/types.tsx";
import ChatBubble from "../ChatBubble/ChatBubble.tsx";
import "./ChatComponent.css";
import { useEffect, useRef, useState } from "react";
import useAutosizeTextArea from "./useAutosizeTextArea";
import throttle from "lodash.throttle";
import BackIcon from "../../assets/icons/arrow_back.svg";

interface ChatComponentProps {
  is_mobile: boolean;
  messages: MessageInterface[];
  user_id: number;
  curr_group_id: number;
  server_id: number;
  newest_msg_index: number;
  users: UserInterface[];
  groups: GroupInterface[];
  onSendClicked: (msg: string) => void;
  onLoadOlderMessages: (group_id: number, len: number) => void;
  onResetNewestMessageIndex: () => void;
  onMobileBackClicked: () => void;
}

const ChatComponent = (props: ChatComponentProps) => {
  const [message, setMessage] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextArea(textAreaRef.current, message);
  const [messageUpdated, setMessageUpdated] = useState(false);
  const [lastScrollHeight, setLastScrollHeight] = useState(0);

  const fetchOldMessages = () => {
    props.onLoadOlderMessages(props.curr_group_id, props.messages.length);
  };

  const throttledFetchOldMessages = throttle(fetchOldMessages, 5000);

  const handleChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = evt.target?.value;
    setMessage(val);
  };

  const clearAndSend = () => {
    const temp = message;
    setMessage("");
    props.onSendClicked(temp);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      clearAndSend();
    }
  };

  const container = useRef<HTMLDivElement>(null);

  const Scroll = () => {
    const { offsetHeight, scrollHeight, scrollTop } =
      container.current as HTMLDivElement;
    if (messageUpdated) {
      setMessageUpdated(false);
      const height_diff = scrollHeight - lastScrollHeight;
      container.current?.scrollTo(0, height_diff - 30);
    } else {
      if (
        props.messages.length > 0 &&
        props.messages[props.messages.length - 1].author == props.user_id
      ) {
        container.current?.scrollTo(0, scrollHeight);
      } else if (scrollHeight - offsetHeight - scrollTop < 700) {
        container.current?.scrollTo(0, scrollHeight);
      }
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    if (e.currentTarget.scrollTop === 0) {
      if (
        props.messages.length > 0 &&
        props.messages[0].author != props.server_id
      ) {
        const { scrollHeight } = container.current as HTMLDivElement;
        setMessageUpdated(true);
        setLastScrollHeight(scrollHeight);
        throttledFetchOldMessages();
      }
    }
  };

  useEffect(() => {
    Scroll();
  }, [props.messages]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      props.onResetNewestMessageIndex();
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [props.newest_msg_index]);

  const curr_group = props.groups.find((grp) => grp.id === props.curr_group_id);

  return (
    <>
      <div
        className={
          props.is_mobile
            ? "chatComponentContainerMobile"
            : "chatComponentContainer"
        }
      >
        <div
          className={props.is_mobile ? "groupNameDivMobile" : "groupNameDiv"}
        >
          <img
            hidden={!props.is_mobile}
            className="backIcon"
            src={BackIcon}
            alt="Back icon"
            onClick={() => props.onMobileBackClicked()}
          />
          <div className="d-flex justify-content-center">
            <img
              hidden={props.curr_group_id == -1}
              src={curr_group?.avatar}
              alt="Group icon"
              className="groupTopIcon"
            ></img>
            <h3 className="ms-3 my-auto">{curr_group?.name}</h3>
          </div>
        </div>
        <div
          className="chatContainer"
          id="chat-feed"
          ref={container}
          onScroll={handleScroll}
        >
          {props.messages.map((item, index) => (
            <ChatBubble
              name={props.users.find((us) => us.id == item.author)?.name}
              avatar={props.users.find((us) => us.id == item.author)?.avatar}
              is_curr_user={props.user_id == item.author}
              is_server={props.server_id == item.author}
              message_time={item.created}
              key={props.curr_group_id + "msg" + index}
              start_animation={
                props.newest_msg_index != -1 && props.newest_msg_index == index
              }
            >
              {item.msg}
            </ChatBubble>
          ))}

          {(props.messages.length == 0) ? <ChatBubble name="" avatar="" is_curr_user={false} message_time="" key="" start_animation={false} is_server={true}>Start by creating or joining a group!</ChatBubble> : ""}
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
            <Button className="defaultAppColor" onClick={clearAndSend}>
              Send
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatComponent;
