import mainLogo from "../../assets/logo.png";
import githubLogo from "../../assets/github_icon.png";
import "./Navbar.css";

interface MobileProps {
  is_mobile: boolean;
}

const NavBar = (props: MobileProps) => {
  if (props.is_mobile) {
    return (
      <nav className=" defaultAppColorNoHover p-2">
        <div className="navbarGridMobile">
          <img
            className="mainLogo ms-1 align-self-center"
            src={mainLogo}
            alt="fireSpot"
          />

          <img
            className="githubIcon githubIconMobile ms-auto me-1 align-self-center"
            src={githubLogo}
            alt="fireSpot"
            onClick={() =>
              window.open("https://github.com/orgs/GroopieChat/repositories")
            }
          />
        </div>
      </nav>
      
    );
    
  } else {
    return (
      <nav className="navbar fixed-top navbar-dark defaultAppColorNoHover p-1">
        <div className="navbarGrid">
          <img
            className="mainLogo ms-3 align-self-center"
            src={mainLogo}
            alt="fireSpot"
          />

          <div className="h6 text-center align-self-center">
            <div className="h5">
              Secure chat with browser-side encryption! <br />
            </div>
            Our servers can't read your messages!
          </div>
          <img
            className="githubIcon ms-auto me-3 align-self-center"
            src={githubLogo}
            alt="fireSpot"
            onClick={() =>
              window.open("https://github.com/orgs/GroopieChat/repositories")
            }
          />
        </div>
      </nav>
    );
  }
};

export default NavBar;
