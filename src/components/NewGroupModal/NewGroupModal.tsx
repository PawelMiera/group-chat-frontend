import Modal from "react-bootstrap/Modal";
import "./NewGroupModal.css";
import { Button } from "react-bootstrap";
import { useState } from "react";

interface Props {
  show: boolean;
  handleClosed: () => void;
}

export function NewGroupModal(props: Props) {
  const [_, setGroupName] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");

  const generateEncryptionKey = () => {
    let charset =
      "!@#$%^&*()0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let newPassword = "";

    for (let i = 0; i < 16; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setEncryptionKey(newPassword);
  };

  return (
    <>
      <Modal
        show={props.show}
        onHide={props.handleClosed}
        centered
        className="my-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New Group</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column">
          <div className="inputGrid">
            <div>Group Name:</div>
            <input
              className="form-control form-control-modal"
              maxLength={30}
              onChange={(e) => setGroupName(e.target.value)}
            ></input>

            <div>Group Encryption Key:</div>
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-modal"
                value={encryptionKey}
                maxLength={24}
                onChange={(e) => setEncryptionKey(e.target.value)}
              ></input>
              <div className="input-group-append">
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={generateEncryptionKey}
                >
                  ↻
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 smallText">
            Leave <b>Group Encryption Key</b> empty for no message encryption
          </div>
          <div className="mt-3 smallText">
            We don't save encryption key on our servers.
            <br />
            It will be stored only in your browser memory.
            <br /> You have to save it somewhere for later use!
          </div>

          <Button className="defaultAppColor mt-3 mx-auto d-inline-flex justify-content-center">
            Create Group
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
}
