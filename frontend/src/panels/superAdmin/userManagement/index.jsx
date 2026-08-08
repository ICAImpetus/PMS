import React, { useContext, useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";

import {
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  useMediaQuery,
  useTheme,
  IconButton,
  Modal,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Paper,
  Avatar,
  Grid,
} from "@mui/material";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LockResetIcon from "@mui/icons-material/LockReset";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import FilterListIcon from "@mui/icons-material/FilterList";
import DensityMediumIcon from "@mui/icons-material/DensityMedium";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

import { nanoid } from "@reduxjs/toolkit";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import UserForm from "./UserForm";
import UpdatePasswordForm from "./UpdatePassword";
import { useApi } from "../../../api/useApi";
import { superAdminRoutes } from "../../../api/apiService";
import { useLocation } from "react-router-dom";
import HospitalContext from "../../../contexts/HospitalContexts";
import BreadcrumbNav from "../../../components/BroadcrumNav.jsx";

// Styled Components
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
  boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.04)",
  backgroundColor: "#FFFFFF",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
}));

// Role Chip Colors mapping to match design
const getRoleChipStyle = (role) => {
  const normalized = (role || "").toLowerCase();
  if (normalized.includes("super") || normalized.includes("admin")) {
    return { bgcolor: "#DBEAFE", color: "#1E40AF" };
  }
  if (normalized.includes("facility") || normalized.includes("manager")) {
    return { bgcolor: "#E0F2FE", color: "#0369A1" };
  }
  if (normalized.includes("clinician") || normalized.includes("doctor")) {
    return { bgcolor: "#F1F5F9", color: "#475569" };
  }
  if (normalized.includes("viewer")) {
    return { bgcolor: "#F1F5F9", color: "#64748B" };
  }
  return { bgcolor: "#EFF6FF", color: "#2563EB" };
};

function UserManagement() {
  const theme = useTheme();
  const location = useLocation();

  const [userUpdateData, setUserUpdateData] = useState(null);
  const [open, setOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [isSuperManager, setIsSuperManager] = useState(null);
  const [openUpdatePasswordModal, setOpenUpdatePasswordModal] = useState(false);
  const [selectedUserForPasswordUpdate, setSelectedUserForPasswordUpdate] = useState(null);
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [searchTerm, setSearchTerm] = useState("");

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    request: deleteUserById,
    error: deleteError,
  } = useApi(superAdminRoutes.deleteUser);

  const {
    hospitals,
    loading,
    selectedHostpital,
    errors,
    userData,
    setSelectedHostpital,
    refetchUsers,
  } = useContext(HospitalContext);

  useEffect(() => {
    if (location?.state?.selectedHostpital) {
      setSelectedHostpital(location?.state?.selectedHostpital);
    }
  }, [location?.state?.selectedHostpital]);

  useEffect(() => {
    if (userData?.length > 0) {
      const superManager = userData.find((user) => user.type === "supermanager");
      setIsSuperManager(superManager || null);
    } else {
      setIsSuperManager(null);
    }
  }, [userData]);

  const deleteUser = async () => {
    const response = await deleteUserById(deleteUserId);
    if (response?.success) {
      if (refetchUsers) await refetchUsers();
      setDeleteOpen(false);
      setDeleteUserId(null);
      toast.success("User deleted successfully");
    }
  };

  const handleDeleteUser = (userId) => {
    setDeleteUserId(userId);
    setDeleteOpen(true);
  };

  const handleOpenUpdateModel = (row) => {
    setUserUpdateData(row);
    setUpdateOpen(true);
  };

  const handleAddUserModel = () => {
    setOpen(true);
  };

  const handleOpenUpdatePasswordModal = (user) => {
    setSelectedUserForPasswordUpdate(user);
    setOpenUpdatePasswordModal(true);
  };

  const handleCloseUpdatePasswordModal = () => {
    setOpenUpdatePasswordModal(false);
    setSelectedUserForPasswordUpdate(null);
  };

  const columns = [
    {
      field: "name",
      headerName: "NAME",
      flex: 1.2,
      minWidth: 180,
      renderCell: (params) => {
        const name = params.row?.name || "N/A";
        const initials = name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();
        return (
          <Box display="flex" alignItems="center" gap={1.5} height="100%">
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: "12px",
                fontWeight: 700,
                bgcolor: "#DBEAFE",
                color: "#1E40AF",
              }}
            >
              {initials}
            </Avatar>
            <Typography variant="body2" fontWeight={700} color="#0F172A">
              {name}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "username",
      headerName: "USERNAME",
      flex: 1,
      minWidth: 140,
      renderCell: (params) => (
        <Typography variant="body2" color="#475569" fontWeight={500}>
          {params.row?.username || "--"}
        </Typography>
      ),
    },
    {
      field: "type",
      headerName: "ROLE",
      flex: 1,
      minWidth: 140,
      renderCell: (params) => {
        const role = params.row?.type || "User";
        const chipStyle = getRoleChipStyle(role);
        return (
          <Chip
            label={role.toUpperCase()}
            size="small"
            sx={{
              ...chipStyle,
              fontWeight: 800,
              fontSize: "10px",
              height: "22px",
              borderRadius: "12px",
            }}
          />
        );
      },
    },
    {
      field: "email",
      headerName: "EMAIL",
      flex: 1.3,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="body2" color="#64748B">
          {params.row?.email || "--"}
        </Typography>
      ),
    },
    {
      field: "editUser",
      headerName: "EDIT USER",
      width: 100,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleOpenUpdateModel(params.row)}
          sx={{ color: "#2563EB", "&:hover": { bgcolor: "#EFF6FF" } }}
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      ),
    },
    {
      field: "updatePassword",
      headerName: "UPDATE PASSWORD",
      width: 150,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleOpenUpdatePasswordModal(params.row)}
          sx={{ color: "#475569", "&:hover": { bgcolor: "#F1F5F9" } }}
        >
          <LockResetIcon fontSize="small" />
        </IconButton>
      ),
    },
    {
      field: "deleteUser",
      headerName: "DELETE USER",
      width: 110,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleDeleteUser(params?.row?.id)}
          sx={{ color: "#EF4444", "&:hover": { bgcolor: "#FEF2F2" } }}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const userDataInTable = useMemo(() => {
    if (!userData) return [];
    return userData
      .filter((user) =>
        user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((user) => ({
        id: user._id || nanoid(),
        ...user,
      }));
  }, [userData, searchTerm]);

  useEffect(() => {
    const error = deleteError || errors?.usersError || null;
    if (error) {
      toast.error(error || "Internal Server Error");
    }
  }, [deleteError, errors?.usersError]);

  if (open || updateOpen) {
    return (
      <RootContainer>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <BreadcrumbNav />
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => {
              setOpen(false);
              setUpdateOpen(false);
            }}
            sx={{
              borderRadius: "8px",
              borderColor: "#CBD5E1",
              color: "#334155",
              textTransform: "none",
            }}
          >
            Back
          </Button>
        </Box>
        <Paper sx={{ p: 4, borderRadius: "16px", border: "1px solid #E2E8F0" }}>
          {open ? (
            <UserForm
              initialState={null}
              onClose={() => setOpen(false)}
              allUsers={userData}
              refetchUsers={refetchUsers}
              hospitalId={selectedHostpital}
              setError={toast.error}
              isInline={true}
            />
          ) : (
            <UserForm
              initialState={userUpdateData}
              onClose={() => setUpdateOpen(false)}
              allUsers={userData}
              refetchUsers={refetchUsers}
              hospitalId={selectedHostpital}
              setError={toast.error}
              isInline={true}
            />
          )}
        </Paper>
      </RootContainer>
    );
  }

  return (
    <RootContainer>
      {/* 1. TOP HEADER / SYSTEM SEARCH BAR */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <TextField
          placeholder="Search system..."
          variant="outlined"
          size="small"
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

        <Box display="flex" alignItems="center" gap={1}>
          <IconButton sx={{ bgcolor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <NotificationsNoneIcon fontSize="small" />
          </IconButton>
          <IconButton sx={{ bgcolor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <SettingsOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton sx={{ bgcolor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* 2. TITLE & ACTION HEADER */}
      <Box mb={3}>
        <Chip
          label="SYSTEM MODULE : ADMINISTRATION"
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
              User <span style={{ color: "#0256E8" }}>Management</span>
            </Typography>
            <Typography variant="body2" color="#64748B" mt={0.5}>
              Manage system access, roles, and security credentials.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<PersonAddAlt1Icon />}
            onClick={handleAddUserModel}
            disabled={!selectedHostpital || isSuperManager !== null}
            sx={{
              borderRadius: "20px",
              backgroundColor: "#003896",
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              py: 1,
              fontSize: "12px",
              "&:hover": { backgroundColor: "#00286B" },
              "&.Mui-disabled": { backgroundColor: "#CBD5E1", color: "#94A3B8" },
            }}
          >
            ADD USERS
          </Button>
        </Box>
      </Box>

      {/* 3. TABLE FILTER CONTROLS BAR */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: "16px 16px 0 0",
          border: "1px solid #E2E8F0",
          borderBottom: "none",
          backgroundColor: "#FFFFFF",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {/* Table View Toolbar Actions */}
        <Box display="flex" gap={2} alignItems="center">
          <Button
            size="small"
            startIcon={<ViewColumnIcon />}
            sx={{ color: "#475569", fontWeight: 700, fontSize: "11px" }}
          >
            COLUMNS
          </Button>
          <Button
            size="small"
            startIcon={<FilterListIcon />}
            sx={{ color: "#475569", fontWeight: 700, fontSize: "11px" }}
          >
            FILTERS
          </Button>
          <Button
            size="small"
            startIcon={<DensityMediumIcon />}
            sx={{ color: "#475569", fontWeight: 700, fontSize: "11px" }}
          >
            DENSITY
          </Button>
          <Button
            size="small"
            startIcon={<FileDownloadOutlinedIcon />}
            sx={{ color: "#475569", fontWeight: 700, fontSize: "11px" }}
          >
            EXPORT
          </Button>
        </Box>

        {/* Filters Context (Hospital Dropdown & Search) */}
        <Box display="flex" alignItems="center" gap={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="caption" fontWeight={700} color="#64748B">
              FACILITY CONTEXT:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                value={selectedHostpital || ""}
                onChange={(e) => setSelectedHostpital(e.target.value)}
                disabled={loading?.hospitalsLoading}
                displayEmpty
                sx={{
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                  backgroundColor: "#F8FAFC",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
                }}
              >
                {loading?.hospitalsLoading ? (
                  <MenuItem value="">
                    <CircularProgress size={16} sx={{ mr: 1 }} /> Loading...
                  </MenuItem>
                ) : hospitals?.length > 0 ? (
                  hospitals.map((hospital) => (
                    <MenuItem key={hospital._id} value={hospital._id}>
                      {hospital.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="">No Facilities Found</MenuItem>
                )}
              </Select>
            </FormControl>
          </Box>

          <TextField
            size="small"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: 220,
              "& .MuiOutlinedInput-root": {
                borderRadius: "20px",
                backgroundColor: "#F8FAFC",
                fontSize: "12px",
                "& fieldset": { borderColor: "#E2E8F0" },
              },
            }}
          />
        </Box>
      </Paper>

      {/* 4. DATAGRID CONTAINER */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "0 0 16px 16px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
          mb: 4,
        }}
      >
        {loading?.userLoading ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="300px">
            <CircularProgress size={36} sx={{ color: "#0256E8", mb: 2 }} />
            <Typography variant="body2" color="#64748B">
              Loading users data...
            </Typography>
          </Box>
        ) : (
          <DataGrid
            rows={userDataInTable}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 25, 50]}
            autoHeight
            rowHeight={56}
            sx={{
              border: "none",
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#FFFFFF",
                borderBottom: "1px solid #E2E8F0",
                color: "#64748B",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.5px",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #F1F5F9",
                fontSize: "13px",
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "1px solid #E2E8F0",
                backgroundColor: "#F8FAFC",
              },
            }}
          />
        )}
      </Paper>

      {/* 5. BOTTOM METRIC CARDS */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <Typography variant="caption" fontWeight={700} color="#64748B">
              TOTAL USERS
            </Typography>
            <Box mt={1} display="flex" alignItems="baseline" gap={1}>
              <Typography variant="h4" fontWeight={800} color="#0F172A">
                {userDataInTable?.length || 42}
              </Typography>
              <Typography variant="caption" fontWeight={700} color="#2563EB">
                ↗ +3
              </Typography>
            </Box>
            <Typography variant="caption" color="#94A3B8" fontSize="10px" mt={0.5}>
              VERIFIED ACCOUNTS
            </Typography>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <Typography variant="caption" fontWeight={700} color="#64748B">
              ACTIVE SESSIONS
            </Typography>
            <Box mt={1} display="flex" alignItems="baseline" gap={1}>
              <Typography variant="h4" fontWeight={800} color="#0F172A">
                18
              </Typography>
              <Chip
                label="LIVE"
                size="small"
                sx={{ bgcolor: "#F1F5F9", color: "#475569", fontWeight: 700, fontSize: "9px", height: "18px" }}
              />
            </Box>
            <Typography variant="caption" color="#94A3B8" fontSize="10px" mt={0.5}>
              REAL-TIME ACCESS
            </Typography>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <Typography variant="caption" fontWeight={700} color="#64748B">
              ROLES DEFINED
            </Typography>
            <Box mt={1}>
              <Typography variant="h4" fontWeight={800} color="#0F172A">
                6
              </Typography>
            </Box>
            <Typography variant="caption" color="#94A3B8" fontSize="10px" mt={0.5}>
              STANDARDIZED PROFILES
            </Typography>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <Typography variant="caption" fontWeight={700} color="#64748B">
              ACCESS REQUESTS
            </Typography>
            <Box mt={1}>
              <Typography variant="h4" fontWeight={800} color="#0F172A">
                0
              </Typography>
            </Box>
            <Typography variant="caption" color="#94A3B8" fontSize="10px" mt={0.5}>
              PENDING APPROVAL
            </Typography>
          </MetricCard>
        </Grid>
      </Grid>

      {/* Update Password Modal */}
      <Modal
        open={openUpdatePasswordModal}
        onClose={handleCloseUpdatePasswordModal}
        aria-labelledby="password-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isSmallScreen ? 320 : 500,
            backgroundColor: "#FFFFFF",
            p: 3,
            borderRadius: "16px",
            boxShadow: "0px 10px 25px rgba(0,0,0,0.1)",
          }}
        >
          {selectedUserForPasswordUpdate && (
            <UpdatePasswordForm
              user={selectedUserForPasswordUpdate}
              onClose={handleCloseUpdatePasswordModal}
            />
          )}
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={deleteUser}
        title="Confirm Deletion"
        message="Are you sure you want to delete this user?"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </RootContainer>
  );
}

export default UserManagement;