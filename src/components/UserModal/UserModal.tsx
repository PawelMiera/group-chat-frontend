import Modal from "react-bootstrap/Modal";
import AvatarEditor from "react-avatar-editor";
import { useState, createRef, useRef, useEffect } from "react";
import { CurrUserInterface, GroupEncryptionInterface } from "../../common/types.tsx";
import { downloadFile } from "../../common/utils";
import { Button } from "react-bootstrap";
import { useCookies } from "react-cookie";
import "rc-slider/assets/index.css";
import Slider from "rc-slider";
import "./UserModal.css";
import useAxios from "../../utils/useAxios";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";

interface Props {
  show: boolean;
  is_mobile: boolean;
  user: CurrUserInterface;
  handleClosed: () => void;
  userUpdated: (new_user: CurrUserInterface) => void;
  onReloadEncryption: (new_enc: GroupEncryptionInterface[]) => void;
}

export function UserModal(props: Props) {
  const [uploaded, setUploaded] = useState("");
  const preparedImageRef: React.RefObject<AvatarEditor> = createRef();
  const imgInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const [nickname, setNickname] = useState("");
  const [cookies, setCookie] = useCookies(["chatEncryption"]);
  const [scale, setScale] = useState(1.6);
  const api = useAxios();
  const { signOut } = useContext(AuthContext);
  const [deleteClicked, setDeleteClicked] = useState(false);

  const closeModal = () => {
    setUploaded("");
    setDeleteClicked(false);
    props.handleClosed();
  };

  useEffect(() => {
    setNickname(props.user.nickname);
  }, [props.user.nickname]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (props.user.nickname != nickname) {
        api.patch("/user/", { first_name: nickname });

        const user: CurrUserInterface = {
          nickname: nickname,
          username: props.user.username,
          id: props.user.id,
          avatar: props.user.avatar,
          date_joined: props.user.date_joined,
          anonymous: props.user.anonymous,
        };

        props.userUpdated(user);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [nickname]);

  const handleConfirmAvatar = () => {
    if (preparedImageRef.current != null) {
      const new_avatar = preparedImageRef.current.getImage().toDataURL();

      api.patch("/user/", { avatar: new_avatar });

      const user: CurrUserInterface = {
        nickname: props.user.nickname,
        username: props.user.username,
        id: props.user.id,
        avatar: new_avatar,
        date_joined: props.user.date_joined,
        anonymous: props.user.anonymous,
      };

      props.userUpdated(user);
    }
    setUploaded("");
  };

  const handleAvatarClicked = () => {
    if (imgInputRef.current != null) imgInputRef.current.click();
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

  const handleUploadEncClicked = () => {
    if (jsonInputRef.current != null) jsonInputRef.current.click();
  };

  const handleChangeJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    const file = e.target.files[0];

    if (file && file.type == "application/json") {

      const fileReader = new FileReader();
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        const target = e.target;
        const result = target?.result;

        if (typeof result == "string")
        {
          const data : GroupEncryptionInterface[] = JSON.parse(result);
          if (typeof cookies.chatEncryption != "undefined") 
          {
            const curr_chat_encryption = cookies.chatEncryption;

            for(let curr_cookie of data)
            {
              const index = curr_chat_encryption.findIndex(
                (enc: GroupEncryptionInterface) => enc["group_uuid"] === curr_cookie.group_uuid
              );
              if (index != -1)
              {
                curr_chat_encryption[index] = curr_cookie;
              }
              else
              {
                curr_chat_encryption.push(curr_cookie);
              }
            }
            setCookie("chatEncryption", curr_chat_encryption);
            props.onReloadEncryption(curr_chat_encryption);
          }
          else
          {
            setCookie("chatEncryption", data);
            props.onReloadEncryption(data);
          }
        }
      };
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

  const handleScaleChanged = (val: number | number[]) => {
    setScale(Number(val));
  };

  const deleteAccount = async () => {
    await api.delete("/user/");
    signOut();
  };

  const button_size = props.is_mobile ? " smallFontMobile" : "";

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
                {props.user.nickname}
              </Modal.Title>
            </div>
          </Modal.Header>
          <Modal.Body className="d-flex flex-column align-items-center">
            <h3 className="mt-3">Delete your account?</h3>
            <h5 className={props.is_mobile ? "mt-1 small" : "mt-1"}>
              All your groups and messages will be removed!
            </h5>

            <div className="groupButtonGrid mt-3">
              <Button
                className={"btn-danger" + button_size}
                onClick={deleteAccount}
              >
                Yes
              </Button>
              <Button
                className={"defaultAppColor" + button_size}
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
            <Modal.Title>{props.user.username}</Modal.Title>
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

            <div className="userTwoButtonGrid mt-3">
              <Button
                className={"btn-danger" + button_size}
                onClick={() => {
                  setUploaded("");
                }}
              >
                Reject
              </Button>

              <Button
                className={"defaultAppColor" + button_size}
                onClick={handleConfirmAvatar}
              >
                Confirm
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </>
    );
  } else if (props.user.anonymous) {
    return (
      <>
        <Modal
          show={props.show}
          onHide={closeModal}
          centered
          className="my-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>{props.user.nickname}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="d-flex flex-column align-items-center">
            <input
              type="file"
              id="input_json"
              ref={jsonInputRef}
              className="inputFiles"
              onChange={handleChangeJson}
            />

            <img className="userAvatarDefault" src={props.user.avatar}></img>

            <div className="align-self-start mt-2 ms-1">Nickname</div>

            <input
              type="text"
              className="form-control form-control-modal mt-1"
              value={nickname}
              maxLength={50}
              placeholder={props.user.nickname}
              disabled={true}
            ></input>
          </Modal.Body>

          <Modal.Footer className="d-flex flex-column align-items-center">
            <div className="userButtonGrid mt-3">
              <Button
                className={"defaultAppColor" + button_size}
                onClick={downloadEncryptionKeys}
              >
                Download encryption keys
              </Button>

              <Button
                className={"defaultAppColor" + button_size}
                onClick={handleUploadEncClicked}
              >
                Upload encryption keys
              </Button>

              <div></div>

              <Button
                className={"btn-danger" + button_size}
                onClick={() => {
                  setDeleteClicked(true);
                }}
              >
                Delete Account
              </Button>
            </div>
          </Modal.Footer>
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
          <Modal.Header closeButton>
            <Modal.Title>{props.user.nickname}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="d-flex flex-column align-items-center">
            <input
              type="file"
              id="input_json"
              ref={jsonInputRef}
              className="inputFiles"
              onChange={handleChangeJson}
            />

            <input
              ref={imgInputRef}
              type="file"
              id="img"
              name="img"
              accept="image/*"
              className="inputFiles"
              onChange={handleChangeImage}
            />
            <img
              className="userAvatarDefault userAvatarDefault"
              src={props.user.avatar}
              onClick={handleAvatarClicked}
            ></img>

            <div className="align-self-start mt-2 ms-1">Nickname</div>

            <input
              type="text"
              className="form-control form-control-modal mt-1"
              value={nickname}
              maxLength={50}
              placeholder={props.user.nickname}
              onChange={(e) => setNickname(e.target.value)}
            ></input>
          </Modal.Body>

          <Modal.Footer className="d-flex flex-column align-items-center">
            <div className="userButtonGrid mt-3">
              <Button
                className={"defaultAppColor" + button_size}
                onClick={downloadEncryptionKeys}
              >
                Download encryption keys
              </Button>

              <Button
                className={"defaultAppColor" + button_size}
                onClick={handleUploadEncClicked}
              >
                Upload encryption keys
              </Button>

              <Button
                className={"defaultAppColor" + button_size}
                onClick={signOut}
              >
                Logout
              </Button>

              <Button
                className={"btn-danger" + button_size}
                onClick={() => {
                  setDeleteClicked(true);
                }}
              >
                Delete Account
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
