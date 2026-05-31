import DevicesIcon from "../../../shared/icons/devices";
import FilesIcon from "../../../shared/icons/files";
import HomeIcon from "../../../shared/icons/home";
import RecentlyEditedIcon from "../../../shared/icons/recentlyEdited";
import RecycleBinIcon from "../../../shared/icons/recycle";
import SharedWithYouIcon from "../../../shared/icons/sharedWithYou";
import StarIcon from "../../../shared/icons/starred";
import HelpCenterIcon from "../../../shared/icons/helpCenter";
import { Navigation, NavItem } from "../../styles/sidebar";
import { ROUTES } from "../../../../router/router";
import { Link, useRouterState } from "@tanstack/react-router";
import { T } from "../../../theme/tokens";

const NavigationMenu = () => {
  const currentPath = useRouterState({
    select: (s) => s.location.pathname,
  });

  const navigationItems = [
    { label: "Home", link: ROUTES.DASHBOARD, Icon: HomeIcon },
    { label: "Your Files", link: ROUTES.YOUR_FILES, Icon: FilesIcon },
    {
      label: "Shared With You",
      link: ROUTES.SHARED_WITH_YOU,
      Icon: SharedWithYouIcon,
    },
    { label: "Recycle Bin", link: ROUTES.RECYCLE_BIN, Icon: RecycleBinIcon },
    {
      label: "Recently Edited",
      link: ROUTES.RECENTLY_EDITED,
      Icon: RecentlyEditedIcon,
    },
    { label: "Favorited", link: ROUTES.FAVORITED, Icon: StarIcon },
    { label: "Devices", link: ROUTES.DEVICES, Icon: DevicesIcon },
    { label: "Help Center", link: ROUTES.HELPCENTER, Icon: HelpCenterIcon },
  ];

  return (
    <Navigation data-tour="tour-sidebar-nav">
      {navigationItems.map(({ label, link, Icon }) => {
        const isActive =
          currentPath === link ||
          (link !== ROUTES.DASHBOARD && currentPath.startsWith(`${link}/`));

        return (
          <NavItem key={label} isActive={isActive} data-active={isActive}>
            <Link to={link}>
              <Icon
                color={isActive ? T.textInvert : T.textSecondary}
                size={16}
              />
              <span>{label}</span>
            </Link>
          </NavItem>
        );
      })}
    </Navigation>
  );
};

export default NavigationMenu;
