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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FilterListIcon from "@mui/icons-material/FilterList";

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

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: "16px",
  border: "1px solid #E2E8F0",
  boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.05)",
  backgroundColor: "#FFFFFF",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  height: "100%",
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  fontSize: "14px",
  minHeight: "40px",
  padding: theme.spacing(1, 2),
  color: "#64748B",
  "&.Mui-selected": {
    color: "#1E293B",
  },
}));

const HospitalCreationNew = () => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState("OVERVIEW"); // OVERVIEW | NETWORK | DIRECTORY

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

  const filteredHospitals = hospitals?.filter((hospital) =>
    hospital?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading?.hospitalLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
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
              borderRadius: "8px",
              borderColor: "#CBD5E1",
              color: "#334155",
              textTransform: "none",
            }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h5" fontWeight={700}>
            {selectedHospital ? "Edit Hospital Details" : "Onboard New Hospital Unit"}
          </Typography>
        </Box>

        <Paper sx={{ p: 4, borderRadius: "16px", border: "1px solid #E2E8F0" }}>
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
          placeholder="Search across hospitals, practitioners, or branches..."
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
              "& fieldset": { borderColor: "#E2E8F0" },
            },
          }}
        />

        <Box display="flex" alignItems="center" gap={1.5}>
          {/* Section Mode Pills */}
          <Box sx={{ bgcolor: "#F1F5F9", p: "4px", borderRadius: "20px", display: "flex", gap: "4px" }}>
            {["OVERVIEW", "NETWORK MAP", "DIRECTORY"].map((mode) => (
              <Button
                key={mode}
                size="small"
                onClick={() => setViewMode(mode)}
                sx={{
                  borderRadius: "16px",
                  px: 2,
                  py: 0.5,
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  bgcolor: viewMode === mode ? "#FFFFFF" : "transparent",
                  color: viewMode === mode ? "#0F172A" : "#64748B",
                  boxShadow: viewMode === mode ? "0px 1px 2px rgba(0,0,0,0.05)" : "none",
                  "&:hover": { bgcolor: viewMode === mode ? "#FFFFFF" : "#E2E8F0" },
                }}
              >
                {mode}
              </Button>
            ))}
          </Box>

          {isSuperAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAdd}
              sx={{
                borderRadius: "20px",
                backgroundColor: "#0256E8",
                textTransform: "none",
                fontWeight: 600,
                px: 2.5,
                "&:hover": { backgroundColor: "#0143B8" },
              }}
            >
              ONBOARD UNIT
            </Button>
          )}

          <IconButton sx={{ bgcolor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <NotificationsNoneIcon fontSize="small" />
          </IconButton>
          <IconButton sx={{ bgcolor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <SettingsOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* 2. HEADER SECTION */}
      <Box mb={3}>
        <Chip
          label="OPERATIONAL NETWORK: UNITS"
          size="small"
          sx={{
            bgcolor: "#EFF6FF",
            color: "#1D4ED8",
            fontWeight: 700,
            fontSize: "10px",
            mb: 1,
            borderRadius: "4px",
          }}
        />
        <Box display="flex" justifyContent="space-between" alignItems="flex-end">
          <Box>
            <Typography variant="h3" component="h1" fontWeight={800} color="#0F172A">
              Hospital <span style={{ color: "#0256E8" }}>Network</span>
            </Typography>
            <Typography variant="body2" color="#64748B" mt={0.5}>
              Centralized management of all registered clinical units.
            </Typography>
          </Box>

          <Box display="flex" gap={1.5} alignItems="center">
            <Chip label="Q4 2024" size="small" variant="outlined" sx={{ fontWeight: 600, borderRadius: "6px" }} />
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              sx={{
                bgcolor: "#0256E8",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                fontSize: "12px",
              }}
            >
              EXPORT METRICS
            </Button>
          </Box>
        </Box>
      </Box>

      {/* 3. METRIC CARDS GRID */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Avatar sx={{ bgcolor: "#EFF6FF", color: "#0256E8", width: 40, height: 40, borderRadius: "10px" }}>
                <LocalHospitalOutlinedIcon />
              </Avatar>
              <Chip label="+2 New" size="small" sx={{ bgcolor: "#E0F2FE", color: "#0369A1", fontWeight: 700, fontSize: "11px" }} />
            </Box>
            <Box mt={2}>
              <Typography variant="caption" color="#64748B" fontWeight={700} sx={{ letterSpacing: "0.5px" }}>
                TOTAL HOSPITALS
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#0F172A">
                {hospitals?.length || 12}
              </Typography>
            </Box>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Avatar sx={{ bgcolor: "#ECFDF5", color: "#059669", width: 40, height: 40, borderRadius: "10px" }}>
                <MedicalServicesOutlinedIcon />
              </Avatar>
              <Typography variant="caption" color="#64748B" fontWeight={600}>
                98% Verified
              </Typography>
            </Box>
            <Box mt={2}>
              <Typography variant="caption" color="#64748B" fontWeight={700} sx={{ letterSpacing: "0.5px" }}>
                TOTAL PRACTITIONERS
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#0F172A">
                458
              </Typography>
            </Box>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Avatar sx={{ bgcolor: "#F5F3FF", color: "#7C3AED", width: 40, height: 40, borderRadius: "10px" }}>
                <HubOutlinedIcon />
              </Avatar>
              <Typography variant="caption" color="#64748B" fontWeight={600}>
                6 STATES
              </Typography>
            </Box>
            <Box mt={2}>
              <Typography variant="caption" color="#64748B" fontWeight={700} sx={{ letterSpacing: "0.5px" }}>
                ACTIVE DEPARTMENTS
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#0F172A">
                84
              </Typography>
            </Box>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Avatar sx={{ bgcolor: "#FEF2F2", color: "#EF4444", width: 40, height: 40, borderRadius: "10px" }}>
                <AccountTreeOutlinedIcon />
              </Avatar>
              <Chip label="3 Issues" size="small" sx={{ bgcolor: "#FEE2E2", color: "#DC2626", fontWeight: 700, fontSize: "11px" }} />
            </Box>
            <Box mt={2}>
              <Typography variant="caption" color="#64748B" fontWeight={700} sx={{ letterSpacing: "0.5px" }}>
                INFRASTRUCTURE NODES
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#0F172A">
                1,204
              </Typography>
            </Box>
          </MetricCard>
        </Grid>
      </Grid>

      {/* 4. MAIN LAYOUT CONTAINER */}
      <Grid container spacing={3}>
        {/* LEFT PANEL - Registered Units */}
        <Grid item xs={12} md={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="caption" fontWeight={800} color="#475569">
              REGISTERED UNITS
            </Typography>
            <Button size="small" startIcon={<FilterListIcon />} sx={{ color: "#0256E8", fontWeight: 700, fontSize: "11px" }}>
              LATEST
            </Button>
          </Box>

          <Box display="flex" flexDirection="column" gap={1.5}>
            {filteredHospitals?.map((hospital, index) => {
              const isSelected = index === 0; // Defaulting first item as active
              return (
                <Paper
                  key={hospital._id || index}
                  onClick={() => handleEditHospital(hospital)}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "16px",
                    cursor: "pointer",
                    bgcolor: isSelected ? "#EFF6FF" : "#FFFFFF",
                    border: isSelected ? "1px solid #BFDBFE" : "1px solid #E2E8F0",
                    transition: "all 0.2s",
                    "&:hover": { borderColor: "#93C5FD" },
                  }}
                >
                  <Box display="flex" gap={2} alignItems="center">
                    <Avatar
                      src={hospital?.hospitallogo}
                      variant="rounded"
                      sx={{ width: 48, height: 48, borderRadius: "12px" }}
                    />
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                          {hospital?.name || "Shekhawati Hospital"}
                        </Typography>
                        {isSelected && (
                          <Chip label="HUB" size="small" sx={{ bgcolor: "#DBEAFE", color: "#1D4ED8", fontWeight: 800, fontSize: "9px" }} />
                        )}
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                        <LocationOnIcon sx={{ fontSize: 14, color: "#94A3B8" }} />
                        <Typography variant="caption" color="#64748B">
                          {hospital?.contact?.city || "Jaipur"}, {hospital?.contact?.state || "Rajasthan"}
                        </Typography>
                      </Box>

                      <Box display="flex" gap={1} mt={1}>
                        <Chip label="124 Staff" size="small" sx={{ bgcolor: "#FFFFFF", border: "1px solid #E2E8F0", fontSize: "10px" }} />
                        <Chip label="12 Dept." size="small" sx={{ bgcolor: "#FFFFFF", border: "1px solid #E2E8F0", fontSize: "10px" }} />
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Box>

          <Button
            fullWidth
            sx={{
              mt: 2,
              color: "#0256E8",
              fontWeight: 700,
              fontSize: "12px",
              textTransform: "uppercase",
            }}
            onClick={() => navigate("/hospital-management/directory")}
          >
            Explore Full Directory
          </Button>
        </Grid>

        {/* RIGHT PANEL - Details & Practitioner Table */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ borderRadius: "20px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
            {/* Banner Header Image Placeholder */}
            <Box
              sx={{
                height: 140,
                bgcolor: "#1E293B",
                backgroundImage: "linear-gradient(to right, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.4))",
                p: 3,
                display: "flex",
                alignItems: "flex-end",
                position: "relative",
              }}
            >
              <Box display="flex" gap={2} alignItems="center">
                <Avatar
                  sx={{ width: 56, height: 56, bgcolor: "#FFFFFF", color: "#0256E8", fontWeight: 700, borderRadius: "12px" }}
                >
                  SH
                </Avatar>
                <Box color="#FFFFFF">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6" fontWeight={700}>
                      Shekhawati Hospital
                    </Typography>
                    <Chip label="PRIMARY HUB" size="small" sx={{ bgcolor: "#0256E8", color: "#FFF", fontSize: "9px", fontWeight: 800 }} />
                  </Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Main Campus | Node: SH-291-JK-IND
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Inner Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: "#E2E8F0", px: 3, bgcolor: "#FFFFFF" }}>
              <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
                <StyledTab label="PRACTITIONER DIRECTORY (124)" />
                <StyledTab label="SPECIALIZATIONS" />
                <StyledTab label="INFRASTRUCTURE" />
              </Tabs>
            </Box>

            {/* Table Content */}
            <Box p={3} bgcolor="#FFFFFF">
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="caption" fontWeight={800} color="#475569">
                  ACTIVE PRACTITIONER STAFF
                </Typography>
                <Box display="flex" gap={1.5}>
                  <TextField
                    placeholder="Filter by name..."
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      width: 200,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "20px",
                        bgcolor: "#F8FAFC",
                        fontSize: "12px",
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      borderRadius: "20px",
                      bgcolor: "#EFF6FF",
                      color: "#0256E8",
                      boxShadow: "none",
                      fontWeight: 700,
                      fontSize: "11px",
                      "&:hover": { bgcolor: "#DBEAFE" },
                    }}
                  >
                    + ONBOARD STAFF
                  </Button>
                </Box>
              </Box>

              <TableContainer sx={{ border: "1px solid #F1F5F9", borderRadius: "12px" }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                    <TableRow>
                      <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}>PRACTITIONER</TableCell>
                      <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}>SPECIALIZATION</TableCell>
                      <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}>EXP.</TableCell>
                      <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}>STATUS</TableCell>
                      <TableCell align="right" sx={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}>ACTION</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { name: "Dr. Anita Sharma", staffId: "STAFF - 102", spec: "Cardiology", exp: "14 Years", status: "On-Call", statusColor: "#059669", bg: "#ECFDF5" },
                      { name: "Dr. Rahul Verma", staffId: "STAFF - 084", spec: "Neurology", exp: "9 Years", status: "In Surgery", statusColor: "#DC2626", bg: "#FEF2F2" },
                    ].map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: "12px", bgcolor: "#E0F2FE", color: "#0369A1", fontWeight: 700 }}>
                              {row.name.split(" ")[1]?.[0] || "D"}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={700} color="#0F172A">
                                {row.name}
                              </Typography>
                              <Typography variant="caption" color="#94A3B8" fontSize="10px">
                                {row.staffId}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="#334155">
                            {row.spec}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="#64748B">
                            {row.exp}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.status}
                            size="small"
                            sx={{ bgcolor: row.bg, color: row.statusColor, fontWeight: 700, fontSize: "10px", height: "22px" }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small">
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination Section */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                <Typography variant="caption" color="#64748B">
                  Refining <strong>124</strong> records across campus
                </Typography>
                <Pagination count={2} size="small" color="primary" />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </RootContainer>
  );
};

export default HospitalCreationNew;