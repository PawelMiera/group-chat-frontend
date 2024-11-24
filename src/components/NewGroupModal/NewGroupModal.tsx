import Modal from "react-bootstrap/Modal";
import "./NewGroupModal.css";
import { Button } from "react-bootstrap";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { downloadFile } from "../../common/utils";
import { FrontendUrl } from "../../services/Urls";
import useAxios from "../../utils/useAxios";

interface Props {
  show: boolean;
  is_mobile: boolean;
  handleClosed: () => void;
  newGroupCreated: (group_uuid: string, enc_key: string) => void;
}

export function NewGroupModal(props: Props) {
  const [groupName, setGroupName] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");
  const [error, setError] = useState("");
  const [cookies, setCookie] = useCookies(["chatEncryption"]);

  const [groupInviteKey, setGroupInviteKey] = useState("");
  const [groupInviteUrl, setGroupInviteUrl] = useState("");
  const [urlCopied, setUrlCopied] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);

  const api = useAxios();

  const closeModal = () => {
    setError("");
    setEncryptionKey("");
    setGroupInviteKey("");
    setGroupName("");
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

  const createNewGroup = async (event: React.SyntheticEvent) => {
    try {
      event.preventDefault();
      setError("");

      var re = /^[a-zA-Z0-9\s]+$/;
      var re_enc = /^[a-zA-Z0-9!@#$%^&*()<>,.]+$/;
      if (!re.test(groupName)) {
        setError("Group name can only contain A-Z, a-z, 0-9 and spaces");
        return;
      }
      if (encryptionKey != "" && !re_enc.test(encryptionKey)) {
        setError(
          "Group Encryption Key can only contain A-Z, a-z, 0-9 and !@#$%^&*()<>,."
        );
        return;
      }

      const response = await api.post("/chat/groups/new/", { name: groupName });
      if (response.status === 201) {
        setError("");
        const curr_chat_encryption = cookies.chatEncryption;

        if (
          curr_chat_encryption != null &&
          typeof curr_chat_encryption != "undefined"
        ) {
          curr_chat_encryption.push({
            group_uuid: response.data["uuid"],
            key: encryptionKey,
          });
          setCookie("chatEncryption", curr_chat_encryption);
        } else {
          const curr_chat_encryption = [
            { group_uuid: response.data["uuid"], key: encryptionKey },
          ];
          setCookie("chatEncryption", curr_chat_encryption);
        }

        setGroupInviteKey(response.data["uuid"] + ":" + encryptionKey);
        setGroupInviteUrl(
          FrontendUrl +
            "/join/" +
            `?uuid=${response.data["uuid"]}&key=${encryptionKey}`
        );

        props.newGroupCreated(response.data["uuid"], curr_chat_encryption);
      } else {
        setError("Failed to create group");
      }
    } catch (error) {
      setError("Failed to create group");
      console.log(error);
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
    if (typeof cookies.chatEncryption != undefined) {
      downloadFile(
        "groopie_keys.json",
        JSON.stringify(cookies.chatEncryption, null, 2)
      );
    }
  };

  const button_size = props.is_mobile ? "" : " btn-lg";
  const text_size = props.is_mobile ? " small" : "";

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
            <form className={"d-flex-inline flex-column"}>
              <div
                className={props.is_mobile ? "inputGridMobile" : "inputGrid"}
              >
                <div>Group Name:</div>
                <input
                  className="form-control form-control-modal"
                  maxLength={50}
                  required
                  pattern="[A-Za-z0-9]"
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
                    pattern="[A-Za-z0-9]"
                  ></input>
                  <div className="input-group-append">
                    <button
                      className={"btn btn-outline-secondary " + button_size}
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

              <div className={"mt-3" + text_size}>
                Leave <b>Group Encryption Key</b> empty for no message
                encryption
              </div>
              <div className={"mt-3" + text_size}>
                We don't save encryption key on our servers.
                <br />
                It will be stored only in your browser memory.
                <br /> You can download config file later use!
              </div>
            </form>

            <Button
              className={"defaultAppColor mt-3 mx-auto" + button_size}
              onClick={createNewGroup}
              type="submit"
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
              <label
                className={
                  "form-control form-control-modal linkOutput me-1" +
                  (props.is_mobile ? " labelMobile" : "")
                }
              >
                {groupInviteKey}
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
              <label
                className={
                  "form-control form-control-modal linkOutput me-1 " +
                  (props.is_mobile ? " labelMobile" : "")
                }
              >
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
              className={
                "defaultAppColor mt-3 mx-auto d-inline-flex " + button_size
              }
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
