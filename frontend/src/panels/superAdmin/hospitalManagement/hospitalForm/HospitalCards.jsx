import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Grid,
  Tooltip,
  useTheme,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import BusinessIcon from "@mui/icons-material/Business";
import { tokens } from "../../../../theme";

const HospitalCards = ({
  hospitals = [],
  onEdit,
  onAssignUser,
  onRemoveUser,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);

  const handleMenuClick = (event, hospital) => {
    event.stopPropagation(); // Prevent card click when menu is clicked
    setAnchorEl(event.currentTarget);
    setSelectedHospital(hospital);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedHospital(null);
  };

  if (!hospitals || hospitals.length === 0) {
    return (
      <Box display="flex" justifyContent="center" mt={4} width="100%">
        <Typography color="textSecondary">No hospitals found.</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      {hospitals.map((hospital) => (
        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          lg={3}
          key={hospital.ID || hospital.id}
        >
          <Card
            sx={{
              // 🔴 FORCE FIX: Hardcoded colors to remove Orange completely
              backgroundColor:
                theme.palette.mode === "dark" ? "#1F2A40" : "#ffffff",
              borderRadius: "12px",
              position: "relative",
              border: "none",
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0px 4px 10px rgba(0, 0, 0, 0.3)"
                  : "0px 2px 10px rgba(0, 0, 0, 0.08)", // Cleaner shadow
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow:
                  theme.palette.mode === "dark"
                    ? "0px 8px 20px rgba(0, 0, 0, 0.4)"
                    : "0px 8px 25px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            {/* Status Dot (Green) */}
            <Box
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "#4cceac", // Explicit Green color
              }}
            />

            <CardContent sx={{ textAlign: "center", pt: 5, pb: 3 }}>
              {/* Menu Icon (3 Dots) */}
              <IconButton
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  color: theme.palette.text.secondary,
                }}
                onClick={(e) => handleMenuClick(e, hospital)}
              >
                <MoreVertIcon />
              </IconButton>

              {/* Hospital Icon */}
              <Box display="flex" justifyContent="center" mb={2}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    // Force Light Blue/Teal background
                    bgcolor:
                      theme.palette.mode === "dark" ? "#4cceac" : "#E0F2F1",
                    color:
                      theme.palette.mode === "dark" ? "#ffffff" : "#00695C",
                    boxShadow: "none",
                  }}
                >
                  <BusinessIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>

              {/* Hospital Name */}
              <Typography
                variant="h6"
                fontWeight="bold"
                color={theme.palette.text.primary}
                noWrap
                title={hospital.name}
                sx={{ mb: 0.5 }}
              >
                {hospital.name || "Unknown Name"}
              </Typography>

              {/* Location */}
              <Typography
                variant="body2"
                color={theme.palette.text.secondary}
                noWrap
                sx={{ mb: 0.5 }}
              >
                {hospital.location || "Location N/A"}
              </Typography>

              {/* State */}
              <Typography
                variant="caption"
                color={theme.palette.text.disabled}
                display="block"
                mb={3}
              >
                {hospital.state || "State N/A"}
              </Typography>

              {/*  Assign User Section */}
              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              >
                {hospital.assignedUser && (
                  // State 1: User IS Assigned
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.05)"
                          : "#F5F5F5",
                      p: 1,
                      borderRadius: "8px",
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      overflow="hidden"
                    >
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          fontSize: 12,
                          bgcolor: "#2196F3", // Standard Blue
                          color: "white",
                        }}
                      >
                        {hospital.assignedUser.name?.[0]?.toUpperCase() || "U"}
                      </Avatar>
                      <Typography
                        variant="body2"
                        fontWeight="500"
                        color={theme.palette.text.primary}
                        noWrap
                        title={hospital.assignedUser.name} // Tooltip for full name
                      >
                        {hospital.assignedUser.name}
                      </Typography>
                    </Box>
                    <Box display="flex">
                      <Tooltip title="Change">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssignUser(hospital);
                          }}
                          sx={{ color: "#2196F3", p: 0.5 }}
                        >
                          <ManageAccountsIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove">
                        <IconButton
                          size="small"
                          onClick={() => onRemoveUser(hospital)}
                          sx={{ color: "#f44336", p: 0.5 }}
                        >
                          <PersonRemoveIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Edit Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow: theme.shadows[3],
          },
        }}
      >
        <MenuItem
          onClick={() => {
            onEdit(selectedHospital);
            handleMenuClose();
          }}
        >
          <EditIcon sx={{ mr: 1.5, fontSize: 18 }} /> Edit Hospital
        </MenuItem>
      </Menu>
    </Grid>
  );
};

export default HospitalCards;
