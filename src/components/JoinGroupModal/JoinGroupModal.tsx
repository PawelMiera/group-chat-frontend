import Modal from "react-bootstrap/Modal";
import "./JoinGroupModal.css";
import { Button } from "react-bootstrap";
import { useState } from "react";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { fetchJoinGroup } from "../../services/ApiChat";
import { useCookies } from "react-cookie";
import { downloadFile } from "../../common/utils";

interface Props {
  show: boolean;
  handleClosed: () => void;
  newGroupJoined: (group_id: string) => void;
}

export function JoinGroupModal(props: Props) {
  const [groupKey, setGroupKey] = useState("");
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState("");
  const [joinedGroup, setJoinedGroup] = useState(false);
  const authHeader = useAuthHeader();
  const [cookies, setCookie] = useCookies(["chatEncryption"]);

  const joinGroup = async () => {
    try {
      const group_data = groupKey.split(":");

      const group_id = group_data[0];
      const encryptionKey = group_data[1];

      const [ok, _, data] = await fetchJoinGroup(authHeader || "", group_id);
      console.log(data);

      if (ok) {


        const curr_chat_encryption = cookies.chatEncryption;

        if (curr_chat_encryption != null && curr_chat_encryption != "") {
          curr_chat_encryption["chatEncryption"].push({
            group_id: group_id,
            key: encryptionKey,
          });
          setCookie("chatEncryption", curr_chat_encryption);
        } else {
          const curr_chat_encryption = {
            chatEncryption: [
              { group_id: data["group_id"], key: encryptionKey },
            ],
          };
          setCookie("chatEncryption", curr_chat_encryption);
        }

        setError("");
        setJoinedGroup(true);
        setGroupName(data["group_name"]);

        props.newGroupJoined(data["group_id"]);

      } else {
        setError("Failed to join group");
        console.log(data);

      }
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
    downloadFile(
      "groopie_keys.json",
      JSON.stringify(cookies.chatEncryption, null, 2)
    );
  };

  if(joinedGroup)
  {
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
            <Modal.Title className="text-success">{"Joined Group: " + groupName}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="d-flex flex-column">
            <div className="mt-3">
              We don't save encryption key on our servers.
              <br />
              It will be stored only in your browser memory.
              <br /> You can download config file later use!
            </div>
  
            <Button
              className="defaultAppColor mt-3 mx-auto d-inline-flex btn-lg"
              onClick={downloadEncryptionKeys}
            >
              Download encryption keys
            </Button>
          </Modal.Body>
        </Modal>
      </>
    );
  }
  else
  {
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
  
            <div className="mt-3">
              We don't save encryption key on our servers.
              <br />
              It will be stored only in your browser memory.
              <br /> You can download config file later use!
            </div>
  
            <Button
              className="defaultAppColor mt-3 mx-auto d-inline-flex justify-content-center btn-lg"
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
