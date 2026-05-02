import React from "react";
import { Button, useTheme, Box } from "@mui/material";
import { tokens } from "../../theme";

// Define the keyframes animation as a string variable
export const keyframes = `
  @keyframes rotate-both-sides {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(3deg); }
    50% { transform: rotate(-3deg); }
    75% { transform: rotate(3deg); }
    100% { transform: rotate(0deg); }
  }
`;

// Define a keyframes animation for oscillating rotation
export const oscillateRotation = {
  "0%": { transform: "rotate(0deg)" },
  "25%": { transform: "rotate(10deg)" },
  "50%": { transform: "rotate(-10deg)" },
  "75%": { transform: "rotate(10deg)" },
  "100%": { transform: "rotate(0deg)" },
};

const CustomButton = ({ icon, children, sx = {}, ...props }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  console.log("colors are :", colors);
  return (
    <Box sx={{ position: "relative" }}>
      <style>{keyframes}</style> {/* Inject the keyframes animation */}
      <Button
        sx={{
          backgroundColor: colors.blueAccent[700],
          color: colors.grey[700],
          fontSize: { xs: "12px", sm: "14px" },
          fontWeight: "bold",
          padding: { xs: "8px 16px", sm: "10px 20px" },
          transition: "transform 0.3s ease",
          "&:hover": {
            animation: "rotate-both-sides 0.5s ease", // Apply the keyframes animation
            backgroundColor: colors.grey[400],
          },
          ...sx, // Additional styles from props
        }}
        {...props}
      >
        {icon && (
          <Box
            component="span"
            sx={{
              mr: { xs: "5px", sm: "10px" },
              display: "flex",
              alignItems: "center",
            //   color: colors.grey[400],
            }}
          >
            {icon}
          </Box>
        )}
        {children}
      </Button>
    </Box>
  );
};

export default CustomButton;
