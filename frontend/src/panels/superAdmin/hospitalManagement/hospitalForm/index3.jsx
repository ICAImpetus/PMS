import React, { useContext, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Avatar,
  Chip,
  IconButton,
  CircularProgress,
  Grid,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";

import { useNavigate } from "react-router-dom";
import HospitalContext from "../../../../contexts/HospitalContexts";
import AddHospitalData1 from "./index2";

// --- Styled Components ---
const RootContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#F8FAFC",
  minHeight: "100vh",
  padding: theme.spacing(3, 4),
  fontFamily: "'Inter', sans-serif",
}));

const HospitalCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "20px",
  border: "1px solid #E2E8F0",
  boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.02)",
  backgroundColor: "#FFFFFF",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  position: "relative",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.05)",
    borderColor: "#CBD5E1",
  },
}));

const CreateNewCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "20px",
  border: "2px dashed #CBD5E1",
  backgroundColor: "#FFFFFF",
  height: "100%",
  minHeight: "160px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    borderColor: "#0256E8",
    backgroundColor: "#EFF6FF",
  },
}));

// Single Card Component with Context Menu
const CustomHospitalCard = ({ hospital, role, onEdit, onManageBranches }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    if (event) event.stopPropagation();
    setAnchorEl(null);
  };

  return (
    <HospitalCard>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box display="flex" gap={2} alignItems="center">
          <Avatar
            src={hospital?.hospitallogo}
            variant="rounded"
            sx={{
              width: 52,
              height: 52,
              borderRadius: "14px",
              bgcolor: "#EFF6FF",
              color: "#0256E8",
              fontWeight: 700,
            }}
          >
            {!hospital?.hospitallogo && <LocalHospitalOutlinedIcon />}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
              {hospital?.name}
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5} mt={0.25}>
              <LocationOnIcon sx={{ fontSize: 14, color: "#94A3B8" }} />
              <Typography variant="caption" color="#64748B" fontWeight={500}>
                {hospital?.contact?.city || hospital?.city || "Location N/A"}
                {hospital?.contact?.state ? `, ${hospital.contact.state}` : ""}
              </Typography>
            </Box>
          </Box>
        </Box>

        <IconButton size="small" onClick={handleMenuClick} sx={{ color: "#94A3B8" }}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Action Popover Menu */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: "14px",
            border: "1px solid #E2E8F0",
            boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.08)",
            mt: 1,
            minWidth: "160px",
          },
        }}
      >
        {

          ["superadmin", "admin"].includes(role) && (
            <MenuItem
              onClick={(e) => {
                handleMenuClose(e);
                onEdit(hospital);
              }}
              sx={{ py: 1, px: 2 }}
            >
              <ListItemIcon sx={{ color: "#475569" }}>
                <EditOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Edit Hospital"
                primaryTypographyProps={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}
              />
            </MenuItem>
          )
        }




        <MenuItem
          onClick={(e) => {
            handleMenuClose(e);
            onManageBranches(hospital);
          }}
          sx={{ py: 1, px: 2 }}
        >
          <ListItemIcon sx={{ color: "#475569" }}>
            <AccountTreeOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Manage Branches"
            primaryTypographyProps={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}
          />
        </MenuItem>
      </Menu>
    </HospitalCard>
  );
};

const HospitalCreationNew = () => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(null);

  const navigate = useNavigate();

  const {
    loading,
    hospitals,
    isSuperAdmin,
    role,
    refetchHospital,
  } = useContext(HospitalContext);

  const handleOpenAdd = () => {
    setSelectedHospital(null);
    setOpen(true);
  };

  const handleEditHospital = (hospital) => {
    setSelectedHospital(hospital);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedHospital(null);
  };

  const handleManageBranches = (hospital) => {
    navigate(`/hospital-management/edit-branches/${hospital._id}`, {
      state: {
        hospital: {
          name: hospital?.name,
          hospitalCode: hospital?.hospitalCode,
          contact: hospital?.contact,
          hospitallogo: hospital?.hospitallogo,
        },
      },
    });
  };

  // Filter hospitals based on search term
  const filteredHospitals = hospitals?.filter((hospital) =>
    hospital?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading?.hospitalLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress sx={{ color: "#0256E8" }} />
      </Box>
    );
  }

  if (open) {
    return (
      <RootContainer>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleClose}
            sx={{
              borderRadius: "12px",
              borderColor: "#CBD5E1",
              color: "#334155",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "12px",
            }}
          >
            Back
          </Button>
          <Typography variant="h5" fontWeight={800} color="#0F172A">
            {selectedHospital ? "Edit Hospital Details" : "Create Hospital Unit"}
          </Typography>
        </Box>

        <Paper sx={{ p: 4, borderRadius: "20px", border: "1px solid #E2E8F0" }}>
          <AddHospitalData1
            initialState={selectedHospital}
            refetchHospital={refetchHospital}
            handleClose={handleClose}
            isInline={true}
          />
        </Paper>
      </RootContainer>
    );
  }

  return (
    <RootContainer>
      {/* 1. TOP NAVBAR */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <TextField
          placeholder="Search by hospital name..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#94A3B8" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: "380px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "24px",
              backgroundColor: "#FFFFFF",
              fontSize: "13px",
              "& fieldset": { borderColor: "#E2E8F0" },
            },
          }}
        />

        <Box display="flex" alignItems="center" gap={1.5}>
          {isSuperAdmin && (
            <Button
              data-testid='createhospitaltextid'
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAdd}
              sx={{
                borderRadius: "20px",
                backgroundColor: "#0256E8",
                color: "#FFFFFF",
                textTransform: "none",
                fontWeight: 700,
                px: 3,
                py: 1,
                fontSize: "12px",
                boxShadow: "0px 2px 4px rgba(2, 86, 232, 0.2)",
                "&:hover": {
                  backgroundColor: "#0143B8",
                  boxShadow: "0px 4px 8px rgba(1, 67, 184, 0.3)"
                },
                "&.Mui-disabled": {
                  backgroundColor: "#CBD5E1",
                  color: "#94A3B8"
                },
              }}
            >
              ADD HOSPITAL
            </Button>
          )}

          <IconButton sx={{ bgcolor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <HelpOutlineIcon fontSize="small" sx={{ color: "#64748B" }} />
          </IconButton>
          <IconButton sx={{ bgcolor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <SettingsOutlinedIcon fontSize="small" sx={{ color: "#64748B" }} />
          </IconButton>
        </Box>
      </Box>

      {/* 2. HEADER TITLE SECTION */}
      <Box mb={4}>
        {/* <Chip
          label="SUPER ADMIN CONSOLE"
          size="small"
          sx={{
            bgcolor: "#EFF6FF",
            color: "#1D4ED8",
            fontWeight: 800,
            fontSize: "10px",
            mb: 1,
            borderRadius: "4px",
          }}
        /> */}
        <Typography variant="h3" component="h1" fontWeight={800} color="#0F172A">
          Hospital <span style={{ color: "#0256E8" }}>Creation</span>
        </Typography>
        <Typography variant="body2" color="#64748B" mt={0.5} fontWeight={500}>
          Manage and onboard new hospital units into the centralized network.
        </Typography>
      </Box>

      {/* 3. HOSPITAL CARDS GRID */}
      <Grid container spacing={3}>
        {filteredHospitals?.map((hospital) => (
          <Grid item xs={12} sm={6} md={4} key={hospital._id || hospital.id}>
            <CustomHospitalCard
              hospital={hospital}
              role={role}
              onEdit={handleEditHospital}
              onManageBranches={handleManageBranches}
            />
          </Grid>
        ))}

        {/* Add New Unit Card */}
        {isSuperAdmin && (
          <Grid item xs={12} sm={6} md={4}>
            <CreateNewCard onClick={handleOpenAdd}>
              <Avatar
                sx={{
                  bgcolor: "#EFF6FF",
                  color: "#0256E8",
                  width: 44,
                  height: 44,
                  mb: 1.5,
                }}
              >
                <AddIcon />
              </Avatar>
              <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                Create New Hospital
              </Typography>
              <Typography variant="caption" color="#94A3B8" fontWeight={500}>
                Add a new unit to the network
              </Typography>
            </CreateNewCard>
          </Grid>
        )}
      </Grid>
    </RootContainer>
  );
};

export default HospitalCreationNew;