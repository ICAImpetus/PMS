import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const SectionLoader = ({ height = "200px", message = "Loading data..." }) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: height,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
      }}
    >
      <CircularProgress />
      {message && (
        <Typography variant="body1" color="textSecondary">
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default SectionLoader;
