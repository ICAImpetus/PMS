import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "../theme";

const Header = ({ title, subtitle }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" } }}>
      <Typography
        variant="h3" // Match AddHeader variant
        fontWeight="bold"
        color={colors.grey[100]}
      >
        {title}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography
          variant="h3"
          sx={{ ml: { xs: 0, sm: 1 }, display: { xs: "none", sm: "block" } }}
        >
          -
        </Typography>
        <Typography
          variant="h3"
          sx={{ ml: { xs: 0, sm: 1 } }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
};


export default Header;
