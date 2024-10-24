import Modal from "react-bootstrap/Modal";
import "./NewGroupModal.css";
import { Button } from "react-bootstrap";
import { useState } from "react";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { fetchCreateNewGroup } from "../../services/ApiChat";
import { useCookies } from "react-cookie";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { downloadFile } from "../../common/utils";

interface Props {
  show: boolean;
  handleClosed: () => void;
  newGroupCreated: (group_id: string) => void;
}

export function NewGroupModal(props: Props) {
  const [groupName, setGroupName] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");
  const [error, setError] = useState("");
  const authHeader = useAuthHeader();
  const [cookies, setCookie] = useCookies(["chatEncryption"]);

  const [groupInviteKey, setGroupInviteKey] = useState("");
  const [groupInviteUrl, setGroupInviteUrl] = useState("");
  const [urlCopied, setUrlCopied] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);

  const closeModal = () => {
    setError("");
    setEncryptionKey("");
    setGroupInviteKey("");
    props.handleClosed();
  };

  const generateEncryptionKey = () => {
    let charset =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let newPassword = "";

    let c_len = Math.floor(Math.random() * (24 - 16 + 1) + 16);

    for (let i = 0; i < c_len; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setEncryptionKey(newPassword);
  };

  const createNewGroup = async () => {
    try {
      setError("");
      const [ok, _, data] = await fetchCreateNewGroup(
        authHeader || "",
        groupName
      );

      if (ok) {
        setError("");
        const curr_chat_encryption = cookies.chatEncryption;

        if (curr_chat_encryption != null && curr_chat_encryption != "") {
          curr_chat_encryption["chatEncryption"].push({
            group_id: data["group_id"],
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

        setGroupInviteKey(data["group_id"] + ":" + encryptionKey);
        setGroupInviteUrl(
          window.location.href +
            `?group_id=${data["group_id"]}&key=${encryptionKey}`
        );

        props.newGroupCreated(data["group_id"]);
      } else {
        setError("Failed to create group");
      }
    } catch (error) {
      setError("Failed to create group");
    }
  };

  const handleUrlCopied = () => {
    if (!urlCopied) {
      setUrlCopied(true);

      setTimeout(() => {
        setUrlCopied(false);
      }, 3000);
    }
  };

  const handleKeyCopied = () => {
    if (!keyCopied) {
      setKeyCopied(true);

      setTimeout(() => {
        setKeyCopied(false);
      }, 3000);
    }
  };
  const downloadEncryptionKeys = () => {
    downloadFile(
      "groopie_keys.json",
      JSON.stringify(cookies.chatEncryption, null, 2)
    );
  };

  if (groupInviteKey == "") {
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
            <Modal.Title>Create New Group</Modal.Title>
          </Modal.Header>
          <Modal.Body className="d-flex flex-column">
            <div className="inputGrid">
              <div>Group Name:</div>
              <input
                className="form-control form-control-modal"
                maxLength={50}
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
                    className="btn btn-outline-secondary btn-lg"
                    type="button"
                    title="Refresh"
                    onClick={generateEncryptionKey}
                  >
                    ↻
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3 text-danger">{error}</div>

            <div className="mt-3">
              Leave <b>Group Encryption Key</b> empty for no message encryption
            </div>
            <div className="mt-3">
              We don't save encryption key on our servers.
              <br />
              It will be stored only in your browser memory.
              <br /> You can download config file later use!
            </div>

            <Button
              className="defaultAppColor mt-3 mx-auto d-inline-flex justify-content-center btn-lg"
              onClick={createNewGroup}
            >
              Create Group
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
            <Modal.Title className="text-success">
              Group created successfully
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="d-flex flex-column">
            <div> Your friends can join with following key:</div>
            <div className="input-group mt-3 align-items-center">
              <label className="form-control form-control-modal linkOutput me-1">
                {" "}
                {groupInviteKey}{" "}
              </label>
              <CopyToClipboard text={groupInviteKey} onCopy={handleKeyCopied}>
                <div className="input-group-append">
                  <button
                    className="btn btn-outline-success copyButton"
                    type="button"
                    title="Copy"
                  >
                    {keyCopied ? "✓" : "⧉"}
                  </button>
                </div>
              </CopyToClipboard>
            </div>

            <div className="mt-3"> Or send them this link:</div>

            <div className="input-group mt-3 align-items-center">
              <label className="form-control form-control-modal linkOutput me-1">
                {" "}
                {groupInviteUrl}
              </label>

              <CopyToClipboard text={groupInviteUrl} onCopy={handleUrlCopied}>
                <div className="input-group-append">
                  <button
                    className="btn btn-outline-success copyButton"
                    type="button"
                    title="Copy"
                  >
                    {urlCopied ? "✓" : "⧉"}
                  </button>
                </div>
              </CopyToClipboard>
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
}
