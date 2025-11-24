import { LeftSection, RightSection, NavbarContainer } from "./styles/navbar";

import Image from "../image/Image";
import NavButton from "./components/NavButton";

import PlusIcon from "../icons/plus";
import NotificationCenterIcon from "../icons/notificationCenter";
import SettingsIcon from "../icons/settings";
import LogOutIcon from "../icons/logout";

const Navbar = () => {
  return (
    <NavbarContainer>
      <LeftSection>
        <Image src="/logo.svg" alt="Logo" width={135} height={90} />
        <NavButton onClick={() => console.log("Plus clicked")}>
          <PlusIcon />
        </NavButton>
      </LeftSection>

      <RightSection>
        <NavButton onClick={() => console.log("Notification Center clicked")}>
          <NotificationCenterIcon />
        </NavButton>
        <NavButton onClick={() => console.log("Settings clicked")}>
          <SettingsIcon />
        </NavButton>
        <NavButton onClick={() => console.log("Log Out clicked")}>
          <LogOutIcon />
        </NavButton>
      </RightSection>
    </NavbarContainer>
  );
};

export default Navbar;
