import React, { useState, useEffect } from "react";
import { Modal, CircularProgress, Box, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const LogoutModal = ({ open, onClose, onLogout }) => {
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setIsSuccess(false);
      // Simulate API call delay
      const timer = setTimeout(() => {
        onLogout().then(() => {
          setIsSuccess(true);
          // Close the modal after 1.5 seconds when success
          setTimeout(() => {
            onClose();
          }, 1500);
        });
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [open, onClose, onLogout]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="logout-modal"
      aria-describedby="logout-modal-description"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "300px",
          outline: "none",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Logging out...
        </Typography>

        {isSuccess ? (
          <CheckCircleOutlineIcon
            sx={{
              color: "green",
              fontSize: 60,
              margin: "16px 0",
            }}
          />
        ) : (
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              margin: "16px 0",
              color: "primary.main",
            }}
          />
        )}

        <Typography variant="body1">
          {isSuccess ? "Successfully logged out!" : "Please wait..."}
        </Typography>
      </Box>
    </Modal>
  );
};

export default LogoutModal;
