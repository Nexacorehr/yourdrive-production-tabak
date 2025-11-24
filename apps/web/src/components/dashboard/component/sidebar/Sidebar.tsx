import { SidebarWrapper } from "../../styles/sidebar";

import UserInfo from "./UserInfo";
import NavigationMenu from "./NavigationMenu";
import UpgradePrompt from "./UpgradePrompt";

const Sidebar = () => {
  return (
    <SidebarWrapper>
      <UserInfo />
      <NavigationMenu />
      <UpgradePrompt
        used="42.5 MB"
        total="15 GB"
        percentage={42.5 / (15 * 1000)}
        onUpgrade={() => console.log("Upgrade clicked")}
      />
    </SidebarWrapper>
  );
};

export default Sidebar;
