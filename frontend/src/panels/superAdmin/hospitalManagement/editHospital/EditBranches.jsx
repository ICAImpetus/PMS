import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  IconButton,
  Avatar,
  CircularProgress,
  Modal,
  Switch,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

// Components
import AddBranchBasic from "./AddBranchBasic";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CallIcon from "@mui/icons-material/Call";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import hospitalIcon from "../../../../assets/hospitalIcon.png";
import { useApi } from "../../../../api/useApi";
import { commonRoutes } from "../../../../api/apiService";
import { UserContextHook } from "../../../../contexts/UserContexts";
import AddIpModal from "../../../../components/customComponents/AddIpModal";

// Styled Components
const RootContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#F8FAFC",
  minHeight: "100vh",
  padding: theme.spacing(3, 4),
  fontFamily: "'Inter', sans-serif",
}));

const HospitalBanner = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "20px",
  border: "1px solid #E2E8F0",
  boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.02)",
  backgroundColor: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing(3),
}));

const BranchCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "20px",
  border: "1px solid #E2E8F0",
  boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.02)",
  backgroundColor: "#FFFFFF",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
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
  minHeight: "180px",
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

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "500px",
  bgcolor: "#FFFFFF",
  borderRadius: "20px",
  boxShadow: "0px 20px 25px -5px rgba(0, 0, 0, 0.1)",
  p: 4,
};

// Branch Item Component with Action Menu
const BranchCardItem = ({
  branch,
  index,
  hospitalId,
  isSuperAdmin,
  isAdmin,
  canDelete,
  onToggleStatus,
  onEdit,
  onDelete,
  onViewInfo,
}) => {
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
    <BranchCard>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              bgcolor: "#EFF6FF",
              color: "#0256E8",
            }}
          >
            <ApartmentOutlinedIcon />
          </Avatar>

          <IconButton size="small" onClick={handleMenuClick} sx={{ color: "#94A3B8" }}>
            <MoreVertIcon fontSize="small" data-testid='branchmoreoptionbtn' />
          </IconButton>
        </Box>

        <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
          {branch?.name || "Unnamed Branch"}
        </Typography>

        <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
          <LocationOnIcon sx={{ fontSize: 14, color: "#94A3B8" }} />
          <Typography variant="caption" color="#64748B" fontWeight={500}>
            {`${branch?.city || "City"}, ${branch?.state || "State"}`}
          </Typography>
        </Box>
      </Box>

      {/* Footer ID and Active Toggle */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} pt={2} borderTop="1px solid #F1F5F9">
        <Typography variant="caption" color="#94A3B8" fontWeight={700}>
          ID: {branch?.code || "N/A"}
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
          {(isSuperAdmin || isAdmin) && (
            <Switch
              checked={branch?.isActive !== false}
              onChange={() => onToggleStatus(index)}
              size="small"
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#0256E8",
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#0256E8",
                },
              }}
            />
          )}
          <Typography
            variant="caption"
            fontWeight={700}
            color={branch?.isActive !== false ? "#0256E8" : "#94A3B8"}
            fontSize="11px"
          >
            {branch?.isActive !== false ? "Active" : "Inactive"}
          </Typography>
        </Box>
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
        <MenuItem
          onClick={(e) => {
            handleMenuClose(e);
            onViewInfo(branch);
          }}
          sx={{ py: 1, px: 2 }}
          data-testid='viewinfooptionbtn'
        >
          <ListItemIcon sx={{ color: "#475569" }}>
            <InfoOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="View Info"
            primaryTypographyProps={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}
          />
        </MenuItem>

        {(isSuperAdmin || isAdmin) && (
          <MenuItem
            onClick={(e) => {
              handleMenuClose(e);
              onEdit(branch);
            }}
            sx={{ py: 1, px: 2 }}
            data-testid='editbranchoptionbtn'
          >
            <ListItemIcon sx={{ color: "#475569" }}>
              <EditOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Edit Branch"
              primaryTypographyProps={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}
            />
          </MenuItem>
        )}

        {canDelete && (
          <MenuItem
            onClick={(e) => {
              handleMenuClose(e);
              onDelete(branch);
            }}
            sx={{ py: 1, px: 2, color: "#EF4444" }}
          >
            <ListItemIcon sx={{ color: "#EF4444" }}>
              <DeleteOutlineIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Delete"
              primaryTypographyProps={{ fontSize: "12px", fontWeight: 700, color: "#EF4444" }}
            />
          </MenuItem>
        )}
      </Menu>
    </BranchCard>
  );
};

const EditBranches = () => {
  const { id } = useParams();
  const location = useLocation();
  const hospital = location.state?.hospital;
  const navigate = useNavigate();

  const [hospitalData, setHospitalBranches] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openIpModal, setOpenIpModal] = useState(false);

  const { currentUser } = UserContextHook();
  const userType = (currentUser?.userType || currentUser?.type || "").toLowerCase();
  const isSuperAdmin = userType === "superadmin";
  const isAdmin = userType === "admin";
  const canDelete = isSuperAdmin || (isAdmin && currentUser?.canDelete);

  const {
    request: getHospitalBranches,
    error: branchesError,
    loading: branchesLoading,
  } = useApi(commonRoutes.getSelectedBranches);
  const {
    request: addHospitalIpAddresses,
    error: addIpError,
    loading: addIpLoading,
  } = useApi(commonRoutes.addHospitalIpAddresses);

  // 3. Remove IP Address Hook
  const {
    request: removeHospitalIpAddress,
    error: removeIpError,
    loading: removeIpLoading,
  } = useApi(commonRoutes.removeHospitalIpAddress);
  const fetchHospitalData = async () => {
    const res = await getHospitalBranches(id);
    setHospitalBranches(res?.data || []);
  };

  useEffect(() => {
    fetchHospitalData();
  }, []);

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  const handleAddIpSubmit = async (newIpAddresses) => {
    try {
      // Pass hospitalId (or selected branch ID) along with the IP payload
      const response = await addHospitalIpAddresses(id, newIpAddresses);

      if (response.success) {
        toast.success("IP addresses added successfully!");
      }
      else {
        toast.error("Error adding IP addresses");
      }
    } catch (error) {
      toast.error(addIpError || "Error adding IP addresses");
    }
  };
  const handleOpenEditModal = (branch) => {
    setSelectedBranch(branch);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedBranch(null);
  };

  const handleOpenDeleteDialog = (branch) => {
    setBranchToDelete(branch);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setBranchToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!branchToDelete) return;

    try {
      const response = await commonRoutes.deleteBranch(id, branchToDelete._id);
      if (response.data.success) {
        handleCloseDeleteDialog();
        fetchHospitalData();
      } else {
        alert(response.data.message || "Failed to delete branch");
      }
    } catch (error) {
      console.error("Delete branch error:", error);
      alert("Error deleting branch. Please try again.");
    }
  };

  const handleToggleStatus = (branchIndex) => {
    setHospitalBranches((prev) =>
      prev.map((branch, index) =>
        index === branchIndex
          ? { ...branch, isActive: !branch.isActive }
          : branch
      )
    );
  };

  useEffect(() => {
    if (branchesError) {
      toast.error(branchesError);
    }
  }, [branchesError]);

  const filteredBranches = hospitalData?.filter((branch) =>
    branch?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (branchesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress sx={{ color: "#0256E8" }} />
      </Box>
    );
  }

  return (
    <RootContainer>
      {/* 1. TOP NAVBAR */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <TextField
          placeholder="Search branches..."
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
          {(isSuperAdmin || isAdmin) && (
            <>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenIpModal(true)} // Opens IP Modal
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
                    boxShadow: "0px 4px 8px rgba(1, 67, 184, 0.3)",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "#CBD5E1",
                    color: "#94A3B8",
                  },
                }}
              >
                Add System Ip
              </Button>
              <Button
                variant="contained"
                data-testid='add-branch-button'
                startIcon={<AddIcon />}
                onClick={handleOpen}
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
                ADD BRANCH
              </Button>
            </>


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
        <Chip
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
        />
        <Typography variant="h3" component="h1" fontWeight={800} color="#0F172A">
          Branches <span style={{ color: "#0256E8" }}>Manager</span>
        </Typography>
        <Typography variant="body2" color="#64748B" mt={0.5} fontWeight={500}>
          Manage and onboard new branch units for the selected hospital.
        </Typography>
      </Box>

      {/* 3. HOSPITAL INFO BANNER */}
      {openModal ? (
        // <Paper sx={{ p: 4, borderRadius: "20px", border: "1px solid #E2E8F0" }}>
        <AddBranchBasic
          setHospitalBranches={setHospitalBranches}
          handleClose={handleClose}
          hospitalId={id}
        />
        // </Paper>
      ) : openEditModal ? (
        // <Paper sx={{ p: 4, borderRadius: "20px", border: "1px solid #E2E8F0" }}>
        <AddBranchBasic
          setHospitalBranches={setHospitalBranches}
          handleClose={handleCloseEditModal}
          hospitalId={id}
          initialData={selectedBranch}
          isEdit={true}
        />
        // </Paper>
      ) : (
        <>
          <HospitalBanner>
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton onClick={() => navigate("/hospital-management")} sx={{ bgcolor: "#F8FAFC" }}>
                <ArrowBackIcon fontSize="small" />
              </IconButton>

              <Avatar
                src={hospital?.hospitallogo || hospitalIcon}
                variant="rounded"
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "14px",
                  bgcolor: "#EFF6FF",
                  border: "1px solid #E2E8F0",
                  padding: "4px",
                }}
              />

              <Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6" fontWeight={800} color="#0F172A">
                    {hospital?.name || "Hospital Name"}
                  </Typography>
                  <Chip
                    icon={<VerifiedUserIcon style={{ fontSize: 14, color: "#0256E8" }} />}
                    label="VERIFIED PARTNER"
                    size="small"
                    sx={{
                      bgcolor: "#EFF6FF",
                      color: "#0256E8",
                      fontWeight: 800,
                      fontSize: "9px",
                      height: "20px",
                    }}
                  />
                </Box>

                <Box display="flex" alignItems="center" gap={2} mt={0.5}>
                  <Typography variant="caption" color="#94A3B8" fontWeight={700}>
                    #ID: {hospital?.hospitalCode || "N/A"}
                  </Typography>

                  {hospital?.contact && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <CallIcon sx={{ fontSize: 13, color: "#94A3B8" }} />
                      <Typography variant="caption" color="#64748B" fontWeight={600}>
                        {hospital?.contact}
                      </Typography>
                    </Box>
                  )}

                  <Box display="flex" alignItems="center" gap={0.5}>
                    <LocationOnIcon sx={{ fontSize: 13, color: "#94A3B8" }} />
                    <Typography variant="caption" color="#64748B" fontWeight={600}>
                      {hospital?.contact?.city || "Location N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </HospitalBanner>

          {/* 4. BRANCH CARDS GRID */}
          <Grid container spacing={3}>
            {filteredBranches?.map((branch, index) => (
              <Grid item xs={12} sm={6} md={4} key={branch._id || index}>
                <BranchCardItem
                  branch={branch}
                  index={index}
                  hospitalId={id}
                  isSuperAdmin={isSuperAdmin}
                  isAdmin={isAdmin}
                  canDelete={canDelete}
                  onToggleStatus={handleToggleStatus}
                  onEdit={handleOpenEditModal}
                  onDelete={handleOpenDeleteDialog}
                  onViewInfo={(b) =>
                    navigate(`/hospital-management/edit-branches/${b._id}/edit`, {
                      state: { hospitalId: id },
                    })
                  }
                />
              </Grid>
            ))}

            {/* Add New Branch Card Button */}
            {(isSuperAdmin || isAdmin) && (
              <Grid item xs={12} sm={6} md={4}>
                <CreateNewCard onClick={handleOpen}>
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
                    Add New Branch
                  </Typography>
                  <Typography variant="caption" color="#94A3B8" fontWeight={500}>
                    Register a new branch for this hospital
                  </Typography>
                </CreateNewCard>
              </Grid>
            )}
          </Grid>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <Box sx={modalStyle}>
          <Typography variant="h6" fontWeight={800} color="#0F172A" mb={1}>
            Confirm Deletion
          </Typography>
          <Typography variant="body2" color="#64748B" mb={3}>
            Are you sure you want to delete <strong>{branchToDelete?.name}</strong>? This action will mark the branch as deleted.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handleCloseDeleteDialog}
              sx={{
                borderRadius: "12px",
                borderColor: "#CBD5E1",
                color: "#475569",
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteConfirm}
              sx={{
                borderRadius: "12px",
                bgcolor: "#EF4444",
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Delete
            </Button>
          </Stack>
        </Box>
      </Modal>
      <AddIpModal
        open={openIpModal}
        onClose={() => setOpenIpModal(false)}
        onSubmit={handleAddIpSubmit}
        hospitalName={hospital?.name || "Hospital Name"}// Optional
        loading={addIpLoading}
      />
    </RootContainer>
  );
};

export default EditBranches;