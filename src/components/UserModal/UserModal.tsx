import Modal from "react-bootstrap/Modal";
import AvatarEditor from "react-avatar-editor";
import { useState, createRef, useRef, useEffect } from "react";
import { CurrUserInterface } from "../../common/types.tsx";
import { downloadFile } from "../../common/utils";
import { Button } from "react-bootstrap";
import { useCookies } from "react-cookie";
import "rc-slider/assets/index.css";
import Slider from "rc-slider";
import "./UserModal.css";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";

import { fetchUpdateUser } from "../../services/ApiUser.tsx";

interface Props {
  show: boolean;
  user: CurrUserInterface;
  handleClosed: () => void;
  userUpdated: (new_user: CurrUserInterface) => void;
}

export function UserModal(props: Props) {
  const [uploaded, setUploaded] = useState("");
  const preparedImageRef: React.RefObject<AvatarEditor> = createRef();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nickname, setNickname] = useState("");
  const [cookies, _] = useCookies(["chatEncryption"]);
  const [scale, setScale] = useState(1.6);
  const authHeader = useAuthHeader();

  const closeModal = () => {
    setUploaded("");
    props.handleClosed();
  };

  useEffect(() => {
    setNickname(props.user.nickname);
  }, [props.user.nickname]);


  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (props.user.nickname != nickname) {
        fetchUpdateUser(authHeader || "", { "first_name": nickname });

        const user: CurrUserInterface = {
          nickname: nickname,
          username: props.user.username,
          id: props.user.id,
          avatar: props.user.avatar,
          date_joined: props.user.date_joined,
        };

        props.userUpdated(user);
      }
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [nickname]);

  const handleConfirmAvatar = () => {
    if (preparedImageRef.current != null) {

      const new_avatar = preparedImageRef.current.getImage().toDataURL()

      fetchUpdateUser(authHeader || "", { "avatar": new_avatar });

      const user: CurrUserInterface = {
        nickname: props.user.nickname,
        username: props.user.username,
        id: props.user.id,
        avatar: new_avatar,
        date_joined: props.user.date_joined,
      };

      props.userUpdated(user);
    }
    setUploaded("");
  };

  const handleAvatarClicked = () => {
    if (fileInputRef.current != null) fileInputRef.current.click();
  };

  const handleChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    // console.log(e.target.name);
    // setImgUrl(URL.createObjectURL(e.target.files[0]));
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

  const downloadEncryptionKeys = () => {
    downloadFile(
      "groopie_keys.json",
      JSON.stringify(cookies.chatEncryption, null, 2)
    );
  };

  const handleScaleChanged = (val: number | number[]) => {
    setScale(Number(val));
  };

  if (uploaded == "") {
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
            <input
              ref={fileInputRef}
              type="file"
              id="img"
              name="img"
              accept="image/*"
              className="inputImage"
              onChange={handleChangeImage}
            />
            <img
              className="userAvatar"
              src={props.user.avatar}
              onClick={handleAvatarClicked}
            ></img>

            <div className="align-self-start mt-3 ms-1">Nickname</div>

            <input
              type="text"
              className="form-control form-control-modal mt-1"
              value={nickname}
              maxLength={50}
              placeholder={props.user.nickname}
              onChange={(e) => setNickname(e.target.value)}
            ></input>

            <Button
              className="defaultAppColor mt-3 mx-auto d-inline-flex btn-lg"
              onClick={downloadEncryptionKeys}
            >
              Download encryption keys
            </Button>

            <Button className="btn-danger mt-3 btn-lg">Delete Account</Button>
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
            <Button
              className="defaultAppColor mt-3 btn-lg"
              onClick={handleConfirmAvatar}
            >
              Confirm
            </Button>
          </Modal.Body>
        </Modal>
      </>
    );
  }
}
