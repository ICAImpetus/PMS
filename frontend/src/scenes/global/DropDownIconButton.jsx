import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useNavigate } from "react-router-dom";
import { UserContextHook } from "../../contexts/UserContexts";
import LogoutModal from "../../components/LogoutModal";

// import CheckAuthentication from '../../authentication/Auth';

const DropdownIconButton = ({ setRefresh }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = UserContextHook();

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
    setAnchorEl(null);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logout();
      return Promise.resolve();
    } catch (error) {
      console.error("Error during logout:", error);
      return Promise.reject(error);
    } finally {
      setRefresh(true);
      navigate("/login", { replace: true });
    }
  };

  const handleCloseLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    // <>
    <div style={{ position: "relative", display: "inline-block" }}>
      <IconButton
        // onClick={handleClick}
        aria-controls="dropdown-menu"
        aria-haspopup="true"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={isHovered ? "hovered" : ""}
        onClick={handleLogout}
        sx={{ color: "white" }}
      >
        {/* <PersonOutlinedIcon /> */}
        <LogoutOutlinedIcon />
        {/* {isHovered && <span className="hover-text">Logout</span>} */}
        {isHovered && (
          <span
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "14px",
              display: "block",
              visibility: "visible",
              opacity: 1,
              transition: "opacity 0.3s ease",
            }}
          >
            Logout
          </span>
        )}
      </IconButton>
      <LogoutModal
        open={isLogoutModalOpen}
        onClose={handleCloseLogoutModal}
        onLogout={handleLogoutConfirm}
      />
      {/* <MenuItem onClick={handleClose}>Add User</MenuItem> */}
      {/* </Menu> */}
      {/* </> */}
    </div>
  );
};

export default DropdownIconButton;
