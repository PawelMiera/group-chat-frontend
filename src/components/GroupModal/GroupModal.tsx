import Modal from "react-bootstrap/Modal";
import AvatarEditor from "react-avatar-editor";
import { useState, createRef, useRef, useEffect } from "react";
import {
  GroupInterface,
  GroupEncryptionInterface,
} from "../../common/types.tsx";
import { Button } from "react-bootstrap";
import { useCookies } from "react-cookie";
import "rc-slider/assets/index.css";
import Slider from "rc-slider";
import "./GroupModal.css";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { FrontendUrl } from "../../services/Urls";
import useAxios from "../../utils/useAxios"

import { fetchUpdateGroup, fetchDeleteGroup } from "../../services/ApiChat.tsx";

interface Props {
  show: boolean;
  group: GroupInterface;
  handleClosed: () => void;
  onGroupUpdated: (new_group: GroupInterface) => void;
  onGroupDeleted: (uuid: string, id: string) => void;
}

export function GroupModal(props: Props) {
  const [uploaded, setUploaded] = useState("");
  const preparedImageRef: React.RefObject<AvatarEditor> = createRef();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [groupName, setGroupName] = useState("");
  const [cookies, setCookie] = useCookies(["chatEncryption"]);
  const [scale, setScale] = useState(1.6);

  const [encKey, setEncKey] = useState("");
  const [encKeyDisabled, setEncKeyDisabled] = useState(true);

  const [groupInviteKey, setGroupInviteKey] = useState("");
  const [groupInviteUrl, setGroupInviteUrl] = useState("");
  const [urlCopied, setUrlCopied] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const [deleteClicked, setDeleteClicked] = useState(false);
  const api = useAxios();

  let curr_enc_key = "";
  let cookie_array: GroupEncryptionInterface[] = [];

  try{
    cookie_array = cookies.chatEncryption;
    const temp_key = cookie_array.find(
      (enc) => enc["group_uuid"] === props.group.uuid
    )?.key;

    if (typeof temp_key != "undefined")
    {
      curr_enc_key = temp_key;
    }
  }
  catch (exc)
  {}

  useEffect(() => {
    let out_enc_key = "";
    if (typeof curr_enc_key != "undefined") {
      out_enc_key = curr_enc_key;
    }

    setGroupInviteKey(props.group.uuid + ":" + out_enc_key);
    setGroupInviteUrl(
      FrontendUrl + "/join/" + `?uuid=${props.group.uuid}&key=${out_enc_key}`
    );
    setEncKey(out_enc_key);
  }, [curr_enc_key, props.group.uuid]);

  useEffect(() => {
    setGroupName(props.group.name);
  }, [props.group.name]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      let out_enc_key = "";
      if (typeof curr_enc_key != "undefined") {
        out_enc_key = curr_enc_key;
      }

      if (out_enc_key != encKey) {
        const curr_chat_encryption = cookies.chatEncryption;

        if (curr_chat_encryption != null && curr_chat_encryption != "") {
          const cookie_array: GroupEncryptionInterface[] =
            curr_chat_encryption["chatEncryption"];
          const index = cookie_array.findIndex(
            (enc) => enc["group_uuid"] === props.group.uuid
          );

          if (index != -1) {
            curr_chat_encryption["chatEncryption"][index] = {
              group_uuid: props.group.uuid,
              key: encKey,
            };
          } else {
            curr_chat_encryption["chatEncryption"].push({
              group_uuid: props.group.uuid,
              key: encKey,
            });
          }

          setCookie("chatEncryption", curr_chat_encryption);
        } else {
          const curr_chat_encryption = {
            chatEncryption: [{ group_uuid: props.group.uuid, key: encKey }],
          };
          setCookie("chatEncryption", curr_chat_encryption);
        }
      }
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [encKey]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (props.group.name != groupName) {

        api.patch('/chat/groups/', {name: groupName,uuid: props.group.uuid});

        const new_group: GroupInterface = {
          name: groupName,
          avatar: props.group.avatar,
          uuid: props.group.uuid,
          last_msg: props.group.last_msg,
          id: props.group.id,
          members: props.group.members,
        };

        props.onGroupUpdated(new_group);
      }
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [groupName]);

  const handleConfirmAvatar = () => {
    if (preparedImageRef.current != null) {
      const new_avatar = preparedImageRef.current.getImage().toDataURL();


      api.patch('/chat/groups/', {avatar: new_avatar,uuid: props.group.uuid});

      const new_group: GroupInterface = {
        name: props.group.name,
        avatar: new_avatar,
        uuid: props.group.uuid,
        last_msg: props.group.last_msg,
        id: props.group.id,
        members: props.group.members,
      };

      props.onGroupUpdated(new_group);
    }
    setUploaded("");
  };

  const handleAvatarClicked = () => {
    if (fileInputRef.current != null) fileInputRef.current.click();
  };

  const handleChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    const file = e.target.files[0];

    if (file && file.type.match(/image\/(png|jpg|jpeg)/i)) {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.result != null) {
          const res = reader.result.toString();
          setUploaded(res);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScaleChanged = (val: number | number[]) => {
    setScale(Number(val));
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

  const handleDeleteGroup = async () => {

    const response = await api.post('/chat/groups/', {"uuid": props.group.uuid});

    if (response.status === 201) {
      props.onGroupDeleted(props.group.uuid, props.group.id);
      closeModal();
    }
  };

  const closeModal = () => {
    setUploaded("");
    setEncKeyDisabled(true);
    setDeleteClicked(false);
    props.handleClosed();
  };

  if (deleteClicked) {
    return (
      <>
        <Modal
          show={props.show}
          onHide={closeModal}
          centered
          className="my-modal"
        >
          <Modal.Header className="align-items-start" closeButton>
            <div className="d-flex flex-column">
              <Modal.Title className="text-break">
                {props.group.name}
              </Modal.Title>
              <div className="small text-break">{props.group.uuid}</div>
            </div>
          </Modal.Header>
          <Modal.Body className="d-flex flex-column align-items-center">
            <h3 className="mt-3">Do you want to delete the group?</h3>

            <div className="groupButtonGrid mt-3">
              <Button className="btn-danger" onClick={handleDeleteGroup}>
                Yes
              </Button>
              <Button
                className="defaultAppColor"
                onClick={() => {
                  setDeleteClicked(false);
                }}
              >
                No
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </>
    );
  } else if (uploaded != "") {
    return (
      <>
        <Modal
          show={props.show}
          onHide={closeModal}
          centered
          className="my-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title className="text-break">{props.group.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="d-flex flex-column align-items-center">
            <AvatarEditor
              ref={preparedImageRef}
              image={uploaded}
              width={250}
              height={250}
              border={50}
              borderRadius={125}
              color={[43, 45, 48, 0.7]} // RGBA
              scale={scale}
              rotate={0}
            />

            <div className="mt-3 mb-1 align-self-start">Scale</div>
            <Slider
              min={0.3}
              max={3}
              step={0.1}
              value={scale}
              onChange={handleScaleChanged}
            />

            <div className="groupButtonGrid mt-3">
              <Button
                className="btn-danger"
                onClick={() => {
                  setUploaded("");
                }}
              >
                Reject
              </Button>

              <Button className="defaultAppColor" onClick={handleConfirmAvatar}>
                Confirm
              </Button>
            </div>
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
        >
          <Modal.Header className="align-items-start" closeButton>
            <div className="d-flex flex-column">
              <Modal.Title className="text-break">
                {props.group.name}
              </Modal.Title>
              <div className="small text-break">{props.group.uuid}</div>
            </div>
          </Modal.Header>
          <Modal.Body className="d-flex flex-column align-items-center">
            <input
              ref={fileInputRef}
              type="file"
              id="img"
              name="img"
              accept="image/*"
              className="inputGroupImage"
              onChange={handleChangeImage}
            />
            <img
              className="groupImgAvatar"
              src={props.group.avatar}
              onClick={handleAvatarClicked}
            ></img>

            <div className="align-self-start mt-2 ms-1">Name</div>

            <input
              type="text"
              className="form-control form-control-modal mt-1"
              value={groupName}
              maxLength={50}
              placeholder={props.group.name}
              onChange={(e) => setGroupName(e.target.value)}
            ></input>

            <div className="align-self-start mt-3 ms-1">
              EncryptionKey - be carefull when changing
            </div>

            <div className="d-flex align-items-center justify-content-center inputEncKey">
              <input
                type="text"
                className="form-control form-control-modal mt-1"
                value={encKey}
                disabled={encKeyDisabled}
                maxLength={50}
                placeholder={encKey}
                onChange={(e) => setEncKey(e.target.value)}
              ></input>

              <div className="form-check form-switch ms-3 bigSwitch d-flex align-items-center">
                <input
                  className="form-check-input customSwitch"
                  type="checkbox"
                  id="flexSwitchCheckDefault"
                  defaultChecked={false}
                  onChange={() => {
                    setEncKeyDisabled(!encKeyDisabled);
                  }}
                />
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer className="d-flex flex-column align-items-center">
            <div className="align-self-start ms-1 mt-1">
              {" "}
              Your friends can join with following key:
            </div>

            <div className="input-group mt-1 align-items-center">
              <label className="form-control form-control-modal linkOutput me-1">
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

            <div className="align-self-start ms-1 mt-3">
              {" "}
              Or send them this link:
            </div>

            <div className="input-group align-items-center">
              <label className="form-control form-control-modal linkOutput me-1">
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

            <div className="groupButtonGrid mt-3">
              <Button className="defaultAppColor">Edit Members</Button>
              <Button
                className="btn-danger"
                onClick={() => {
                  setDeleteClicked(true);
                }}
              >
                Delete Group
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
