import DevicesIcon from "../../../shared/icons/devices";
import FilesIcon from "../../../shared/icons/files";
import HomeIcon from "../../../shared/icons/home";
import RecentlyEditedIcon from "../../../shared/icons/recentlyEdited";
import RecycleBinIcon from "../../../shared/icons/recycle";
import SharedWithYouIcon from "../../../shared/icons/sharedWithYou";
import StarIcon from "../../../shared/icons/starred";
import { Navigation, NavItem } from "../../styles/sidebar";

type NavProps = { color: string; isActive: boolean };

const NavigationMenu = () => {
  const DEFAULT_COLOR = "#363840";

  const navigationItems = [
    { label: "Home", link: "/", Icon: HomeIcon },
    { label: "Your Files", link: "/your-files", Icon: FilesIcon },
    {
      label: "Shared With You",
      link: "/shared-with-you",
      Icon: SharedWithYouIcon,
    },
    { label: "Recycle Bin", link: "/recycle-bin", Icon: RecycleBinIcon },
    { label: "Devices", link: "/devices", Icon: DevicesIcon },
    {
      label: "Recently Edited",
      link: "/recently-edited",
      Icon: RecentlyEditedIcon,
    },
    { label: "Favorited", link: "/favorited", Icon: StarIcon },
  ];

  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "/";

  return (
    <Navigation>
      {navigationItems.map(({ label, link, Icon }) => {
        const isActive = link === currentPath;
        const navProps: NavProps = {
          color: isActive ? "#fff" : DEFAULT_COLOR,
          isActive,
        };

        return (
          <NavItem key={label} {...navProps}>
            <a href={link}>
              <Icon color={navProps.color} />
              <span>{label}</span>
            </a>
          </NavItem>
        );
      })}
    </Navigation>
  );
};

export default NavigationMenu;
