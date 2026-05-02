import { Box, Typography, IconButton, Tooltip, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const AddHeader = ({ text, onClick, buttonLabel = "Add", showButton = true }) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    // width="100%"
    >
      {/* Left: Title */}
      {showButton && (
        <Button variant="h6" sx={{
          backgroundColor: "#212f3d",
          color: "white",
          ":hover": {
            backgroundColor: "#3b4c5d",
          }
        }} fontWeight={600} onClick={onClick}>
          <AddIcon color="white" /> {text}
        </Button>
      )}
    </Box>
  );
};

export default AddHeader;