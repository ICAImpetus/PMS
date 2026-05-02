import { Box, IconButton, useTheme, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { ColorModeContext, tokens } from "../../theme";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import logoImage from "../../../src/assets/newLogoInfinis.png";
import { ProfilePopup } from "./ProfileAndCodeAnnousementPopup";
import { UserContextHook } from "../../contexts/UserContexts";
import { NewsTicker } from "./NewsTicker";
import NotificationCenter from "../../components/NotificationCenter";

const Topbar = ({ setRefresh, handleModelOpen, setIsToggled, toggled }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const { currentUser } = UserContextHook();

  const [profileModalOpen, setProfileModalOpen] = useState(false);

  return (
    <Box
      display="flex"
      alignItems="center"
      p={2}
      backgroundColor={
        theme.palette.mode === "dark" ? colors.primary[800] : "#212f3d"
      }
    >
      {/* LEFT - LOGO */}
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton
          onClick={() => setIsToggled(!toggled)}
          sx={{ display: { xs: "flex", md: "none" }, color: "white" }}
        >
          <MenuOutlinedIcon />
        </IconButton>
        <img src={logoImage} alt="Logo" style={{ height: 40 }} />
      </Box>

      {/* CENTER - TICKER */}
      <Box
        sx={{
          flex: 1,          //important
          mx: 2,
          overflow: "hidden"
        }}
      >
        <NewsTicker currentUser={currentUser} />
      </Box>

      {/* RIGHT - ICONS */}
      <Box display="flex" alignItems="center" gap={2}>
        {/* <IconButton>
          <NotificationsOutlinedIcon sx={{ color: "white" }} />
        </IconButton> */}

        {/* <IconButton>
          <SettingsOutlinedIcon sx={{ color: "white" }} />
        </IconButton> */}

        <div
          style={{ cursor: "pointer" }}
          onClick={() => setProfileModalOpen(true)}
        >
          <div className="avatar">{currentUser.name.charAt(0)}</div>
        </div>

        <NotificationCenter />

        <IconButton onClick={handleLogout}>
          <LogoutIcon sx={{ color: "white" }} />
        </IconButton>
      </Box>
      {profileModalOpen && (
        <Box>
          <ProfilePopup
            user={currentUser}
            onClose={() => setProfileModalOpen(false)}
            handleLogout={handleLogout}
          />
        </Box>
      )}
    </Box>
  );
};

export default Topbar;
