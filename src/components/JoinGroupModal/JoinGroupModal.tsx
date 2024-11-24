import Modal from "react-bootstrap/Modal";
import "./JoinGroupModal.css";
import { Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { downloadFile } from "../../common/utils";
import useAxios from "../../utils/useAxios";

interface Props {
  show: boolean;
  is_mobile: boolean;
  groupToJoin: string;
  handleClosed: () => void;
  newGroupJoined: (group_uuid: string, enc_key: string) => void;
}

export function JoinGroupModal(props: Props) {
  const [groupKey, setGroupKey] = useState("");
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState("");
  const [joinedGroup, setJoinedGroup] = useState(false);
  const [cookies, setCookie] = useCookies(["chatEncryption"]);
  const api = useAxios();

  const handleJoinGroup = async (group_uuid: string, encryptionKey: string) => {
    const response = await api.post("/chat/groups/join/", { uuid: group_uuid });

    if (response.status === 200) {
      const curr_chat_encryption = cookies.chatEncryption;

      if (
        curr_chat_encryption != null &&
        typeof curr_chat_encryption != "undefined"
      ) {
        curr_chat_encryption.push({
          group_uuid: group_uuid,
          key: encryptionKey,
        });
        setCookie("chatEncryption", curr_chat_encryption);
      } else {
        const curr_chat_encryption = [
          { group_uuid: response.data["uuid"], key: encryptionKey },
        ];
        setCookie("chatEncryption", curr_chat_encryption);
      }

      setError("");
      setJoinedGroup(true);
      setGroupName(response.data["name"]);

      props.newGroupJoined(response.data["uuid"], encryptionKey);
    } else {
      setError("Failed to join group");
      console.log(response.data);
    }
  };

  const joinGroup = async () => {
    try {
      const group_data = groupKey.split(":");

      const group_uuid = group_data[0];
      const encryptionKey = group_data[1];

      await handleJoinGroup(group_uuid, encryptionKey);
    } catch (error) {
      setError("Failed to join group");
    }
  };

  const closeModal = () => {
    setError("");
    setGroupKey("");
    setGroupName("");
    setJoinedGroup(false);
    props.handleClosed();
  };

  const downloadEncryptionKeys = () => {
    if (typeof cookies.chatEncryption != undefined) {
      downloadFile(
        "groopie_keys.json",
        JSON.stringify(cookies.chatEncryption, null, 2)
      );
    }
  };

  useEffect(() => {
    if (props.groupToJoin != "") {
      try {
        const parsed_join = JSON.parse(props.groupToJoin);
        if (
          parsed_join.hasOwnProperty("uuid") &&
          parsed_join.hasOwnProperty("key")
        ) {
          localStorage.removeItem("joinGroup");
          handleJoinGroup(parsed_join["uuid"], parsed_join["key"]);
        }
      } catch (error) {
        console.log("Failed to join group");
        setError("Failed to join group");
      }
    }
  }, [props.groupToJoin]);

  const text_size = props.is_mobile ? " small" : "";
  const button_size = props.is_mobile ? "" : " btn-lg";

  if (joinedGroup) {
    return (
      <>
        <Modal
          show={props.show}
          onHide={closeModal}
          centered
          className="my-modal"
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title className="text-success">
              {"Joined Group: " + groupName}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="d-flex flex-column">
            <div className={"mt-3" + text_size}>
              We don't save encryption key on our servers.
              <br />
              It will be stored only in your browser memory.
              <br /> You can download config file later use!
            </div>

            <Button
              className={
                "defaultAppColor mt-3 mx-auto d-inline-flex" + button_size
              }
              onClick={downloadEncryptionKeys}
            >
              Download encryption keys
            </Button>
          </Modal.Body>
        </Modal>
      </>
    );
  } else {
    return (
      <>
        <Modal
          show={props.show}
          onHide={closeModal}
          centered
          className="my-modal"
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Join Group </Modal.Title>
          </Modal.Header>
          <Modal.Body className="d-flex flex-column">
            <div>Group Invite Key:</div>
            <input
              className="form-control form-control-modal mt-3"
              maxLength={70}
              onChange={(e) => setGroupKey(e.target.value)}
            ></input>
            <div className="mt-3 text-danger">{error}</div>

            <div className={"mt-3" + text_size}>
              We don't save encryption key on our servers.
              <br />
              It will be stored only in your browser memory.
              <br /> You can download config file later use!
            </div>

            <Button
              className={"defaultAppColor mt-3 mx-auto" + button_size}
              onClick={joinGroup}
            >
              Join Group
            </Button>
          </Modal.Body>
        </Modal>
      </>
    );
  }
}
