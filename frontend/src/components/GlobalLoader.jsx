import React, { useState, useEffect } from "react";
import { Backdrop, CircularProgress, Typography, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme";

const GlobalLoader = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("Loading...");

    useEffect(() => {
        const handleLoaderEvent = (event) => {
            const { show, message: msg } = event.detail;
            setLoading(show);
            if (msg) setMessage(msg);
            else setMessage("Loading..."); // Reset to default
        };

        window.addEventListener("global-loader", handleLoaderEvent);

        return () => {
            window.removeEventListener("global-loader", handleLoaderEvent);
        };
    }, []);

    return (
        <Backdrop
            sx={{
                color: "#fff",
                zIndex: (theme) => Math.max.apply(Math, Object.values(theme.zIndex)) + 1000, // Ensure strictly on top
                display: "flex",
                flexDirection: "column",
                gap: 2,
                backgroundColor: "rgba(0, 0, 0, 0.7)" 
            }}
            open={loading}
        >
            <CircularProgress color="inherit" size={60} thickness={4} />
            <Box sx={{ mt: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", letterSpacing: "1px" }}>
                    {message}
                </Typography>
            </Box>
        </Backdrop>
    );
};

export default GlobalLoader;
