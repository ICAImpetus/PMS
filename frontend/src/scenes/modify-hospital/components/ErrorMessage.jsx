import React from "react";
import { Box, Typography, Paper, useTheme } from "@mui/material";
import { tokens } from "../../../theme";

const ErrorMessage = ({ message = "Data fetch failed. Please try again." }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <Box
            sx={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "85vh",
                // backgroundColor: "rgba(0, 0, 0, 0.1)", // Light overlay effect
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    padding: "16px 24px",
                    backgroundColor: colors.redAccent[500],
                    //   color: "white",
                    textAlign: "center",
                    borderRadius: "8px",
                    minWidth: "280px",
                }}
            >
                <Typography variant="h6" fontWeight="bold">
                    {message}
                </Typography>
            </Paper>
        </Box>
    );
};

export default ErrorMessage;
