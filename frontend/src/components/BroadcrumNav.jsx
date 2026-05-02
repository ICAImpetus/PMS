import React from "react";
import {
  Box,
  Breadcrumbs,
  Typography,
  Link as MUILink,
  IconButton,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { Link, useLocation } from "react-router-dom";
import SupportOutlinedIcon from "@mui/icons-material/SupportOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const SupportAndSettings = () => {
  return (
    <Box display="flex" alignItems="center" gap={3}>
      <Box display="flex" alignItems="center" gap={1}>
        <SupportOutlinedIcon fontSize="small" />
        <Typography variant="body2">Support</Typography>
      </Box>

      <Box display="flex" alignItems="center" gap={1}>
        <SettingsIcon fontSize="small" />
        <Typography variant="body2">Settings</Typography>
        <KeyboardArrowDownIcon fontSize="small" />
      </Box>
    </Box>
  );
};

const BreadcrumbNav = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      px={2}
      py={1}
    >
      {/* <Breadcrumbs separator="›" aria-label="breadcrumb">
        <MUILink
          component={Link}
          to="/"
          color="inherit"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
          Homes
        </MUILink>

        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;

          return isLast ? (
            <Typography key={to} color="text.primary">
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </Typography>
          ) : (
            <MUILink key={to} component={Link} to={to} color="inherit">
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </MUILink>
          );
        })}
      </Breadcrumbs> */}

      {/* Optional icons like Support/Settings */}
      {/* <Box display="flex" alignItems="center" gap={2}>
        <Typography sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          🛟 Support
        </Typography>
        <Typography sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          ⚙️ Settings
        </Typography>
      </Box> */}
      <SupportAndSettings />
    </Box>
  );
};

export default BreadcrumbNav;
