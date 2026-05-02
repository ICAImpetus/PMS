import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Avatar,
  Stack,
  CircularProgress,
  Modal,
  Divider,
  useTheme,
  Switch,
  Tooltip,
} from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getDataFunc } from "../../../../utils/services";
import { tokens } from "../../../../theme";

// Components
import AddBranchBasic from "./AddBranchBasic"; // Ensure this file is in the same folder
import Header from "../../../../components/HeaderNew";
import BreadcrumbNav from "../../../../components/BroadcrumNav";

// Icons
import EditIcon from "@mui/icons-material/Edit";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import CallIcon from "@mui/icons-material/Call";
import DeleteIcon from "@mui/icons-material/Delete";
import hospitalIcon from "../../../../assets/hospitalIcon.png";
import { useApi } from "../../../../api/useApi";
import { commonRoutes } from "../../../../api/apiService";
import { UserContextHook } from "../../../../contexts/UserContexts";
import toast from "react-hot-toast";

// Modal Style
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "600px",
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  p: 1,
  maxHeight: "90vh",
  overflowY: "auto",
};

const EditBranches = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { id } = useParams(); // Hospital ID (might be name or ObjectId)
  const location = useLocation()
  const hospital = location.state?.hospital
  const navigate = useNavigate();
  const [hospitalData, setHospitalBranches] = useState([]);
  const [openModal, setOpenModal] = useState(false); // Add Branch Modal
  const [openEditModal, setOpenEditModal] = useState(false); // Edit Branch Modal
  const [selectedBranch, setSelectedBranch] = useState(null); // Selected branch for editing/viewing// Store the actual ObjectId
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);

  const { currentUser } = UserContextHook();
  const userType = (currentUser?.userType || currentUser?.type || "").toLowerCase();
  const isSuperAdmin = userType === "superadmin";
  const isAdmin = userType === "admin";
  const canDelete = isSuperAdmin || (isAdmin && currentUser?.canDelete);
  // Fetch Data
  const {
    request: getHospitalBranches,
    error: branchesError,
    loading: branchesLoading,
  } = useApi(commonRoutes.getSelectedBranches);

  const fetchHospitalData = async () => {
    const res = await getHospitalBranches(id);
    setHospitalBranches(res?.data || []);
  };

  useEffect(() => {
    // setLoading(true);
    fetchHospitalData();
  }, []);

  // Modal Handlers
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => {
    setOpenModal(false);
  };

  // Edit Modal Handlers
  const handleOpenEditModal = (branch) => {
    setSelectedBranch(branch);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedBranch(null);
  };

  // Delete Branch Handlers
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
      } else {
        alert(response.data.message || "Failed to delete branch");
      }
    } catch (error) {
      console.error("Delete branch error:", error);
      alert("Error deleting branch. Please try again.");
    }
  };

  // Toggle branch status
  const handleToggleStatus = (branchIndex) => {
    setHospitalBranches((prev) =>
      prev.map((branch, index) =>
        index === branchIndex
          ? { ...branch, isActive: !branch.isActive }
          : branch,
      ),
    );
  };

  useEffect(() => {
    const error = branchesError
    if (error) {
      toast.error(branchesError)
    }
  }, [branchesError])
  if (branchesLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  // if (!hospitalData) {
  //   return (
  //     <Box p={3} textAlign="center">
  //       <Typography variant="h5" color="error">
  //         Branches not found.
  //       </Typography>
  //       <Button onClick={() => navigate("/hospital-management")} sx={{ mt: 2 }}>
  //         Go Back
  //       </Button>
  //     </Box>
  //   );
  // }

  return (
    <Box
      sx={{
        width: "100%",
        padding: "20px",
        height: "calc(100vh - 100px)",
        overflowY: "auto",
      }}
    >
      {/* Top Header */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        gap={2}
        mb={2}
      >
        <Header title="Manage" subtitle="Hospital Branches" />
        {isSuperAdmin || isAdmin ? (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleOpen}
            sx={{ fontWeight: "bold", borderRadius: "20px", width: { xs: "100%", sm: "auto" } }}
            data-testid="add-branch-button"
          >
            Add Branch
          </Button>
        ) : null}
      </Box>

      <Divider sx={{ borderBottomWidth: 2, mb: 2 }} />
      {/* <BreadcrumbNav />
      <Divider sx={{ borderBottomWidth: 2, my: 2 }} /> */}

      {/* Hospital Info Banner */}
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 3,
          backgroundColor:
            theme.palette.mode === "dark" ? colors.primary[800] : "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 2
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => navigate("/hospital-management")}>
            <ArrowBackIcon />
          </IconButton>
          <Avatar
            src={hospital?.hospitallogo || hospitalIcon}
            sx={{
              width: 64, height: 64, border: '1px solid lightgrey', bgcolor: "white", "& img": {
                objectFit: "contain",
                padding: "8px"
              }
            }}
          >
            <LocalHospitalIcon />
          </Avatar>
          <Box sx={{ overflow: "hidden" }}>
            <Typography variant="h5" fontWeight="bold" color={colors.grey[100]} >
              {hospital?.name}
            </Typography>
            <Typography variant="subtitle2" color={colors.greenAccent[500]}>
              ID: {hospital?.hospitalCode}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            bgcolor:
              theme.palette.mode === "dark" ? colors.primary[900] : "#f0f0f0",
            p: 1,
            px: 2,
            borderRadius: 2,
          }}
        >
          <CallIcon color="secondary" fontSize="small" />
          <Typography variant="body1" fontWeight={600}>
            {hospital?.contact}
          </Typography>
        </Box>
      </Box>

      {/* Branches List Grid */}
      <Grid container spacing={3}>
        {hospitalData?.length > 0 ? (
          hospitalData?.map((branch, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: "transform 0.2s",
                  "&:hover": { transform: "translateY(-5px)", boxShadow: 6 },
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? colors.primary[600]
                      : "#f8f9fa",
                }}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="start"
                    mb={2}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {branch?.name || "Unnamed Branch"}
                      </Typography>
                      <Chip
                        label={branch?.code || "No Code"}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Tooltip
                        title={
                          branch?.isActive !== false ? "Active" : "Inactive"
                        }
                      >
                        {(isSuperAdmin || isAdmin) && (
                          <Switch
                            checked={branch?.isActive !== false}
                            onChange={() => handleToggleStatus(index)}
                            size="small"
                            sx={{
                              "& .MuiSwitch-switchBase.Mui-checked": {
                                color: colors.greenAccent[500],
                              },
                              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                              {
                                backgroundColor: colors.greenAccent[500],
                              },
                            }}
                          />
                        )}

                      </Tooltip>
                      <Avatar
                        sx={{
                          bgcolor: colors.blueAccent[600],
                          width: 40,
                          height: 40,
                        }}
                      >
                        <LocalHospitalIcon fontSize="small" />
                      </Avatar>
                    </Stack>
                  </Stack>

                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    mb={3}
                    color={colors.grey[300]}
                  >
                    <LocationOnIcon fontSize="small" color="error" />
                    <Typography variant="body2" color="textSecondary" noWrap>
                      {`${branch?.city}, ${branch?.state}` ||
                        "Location not specified"}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Stack direction="row" gap={1}>
                    {(isSuperAdmin || isAdmin) && (
                      <Button
                        variant="contained"
                        data-testid={`edit-branch-button`}
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenEditModal(branch)}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: "bold",
                          background: `linear-gradient(45deg, ${colors.blueAccent[700]}, ${colors.blueAccent[500]})`,
                          flex: 1,
                        }}
                      >
                        Edit
                      </Button>
                    )}

                    <Button
                      variant="outlined"
                      onClick={() => {
                        // console.log("branch", branch?._id);
                        navigate(
                          `/hospital-management/edit-branches/${branch._id}/edit`,
                          { state: { hospitalId: id } }
                        );
                      }}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: "bold",
                        borderColor: colors.grey[600],
                        color: colors.grey[100],
                        flex: 1,
                        "&:hover": {
                          borderColor: colors.blueAccent[500],
                          backgroundColor: colors.blueAccent[900],
                        },
                      }}
                    >
                      View Info
                    </Button>
                    {canDelete && (
                      <IconButton
                        onClick={() => handleOpenDeleteDialog(branch)}
                        sx={{
                          color: theme.palette.error.main,
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,0,0,0.1)' : 'rgba(255,0,0,0.05)',
                          '&:hover': {
                            bgcolor: 'rgba(255,0,0,0.2)',
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box
              textAlign="center"
              py={10}
              bgcolor={
                theme.palette.mode === "dark" ? colors.primary[900] : "#f5f5f5"
              }
              borderRadius={2}
            >
              <LocalHospitalIcon
                sx={{ fontSize: 60, color: colors.grey[500], mb: 2 }}
              />
              <Typography variant="h6" color="textSecondary">
                No branches found for this hospital.
              </Typography>
              <Button variant="text" color="secondary" onClick={handleOpen}>
                Create First Branch
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Add Branch Modal */}
      <Modal open={openModal} onClose={handleClose}>
        <Box sx={modalStyle}>
          <AddBranchBasic
            setHospitalBranches={setHospitalBranches}
            handleClose={handleClose}
            hospitalId={id}
          />
        </Box>
      </Modal>

      {/* Edit Branch Modal */}
      <Modal open={openEditModal} onClose={handleCloseEditModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" mb={2}>
            Edit Branch: {selectedBranch?.name}
          </Typography>
          <AddBranchBasic

            setHospitalBranches={setHospitalBranches}
            handleClose={handleCloseEditModal}
            hospitalId={id}
            initialData={selectedBranch}
            isEdit={true}
          />
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <Box sx={{ ...modalStyle, p: 4, textAlign: 'center' }}>
          <Typography variant="h5" mb={2} fontWeight="bold">
            Confirm Deletion
          </Typography>
          <Typography variant="body1" mb={4}>
            Are you sure you want to delete <strong>{branchToDelete?.name}</strong>?
            This action will mark the branch as deleted.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              onClick={handleCloseDeleteDialog}
              sx={{ borderRadius: "20px", px: 4 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteConfirm}
              sx={{ borderRadius: "20px", px: 4 }}
            >
              Delete
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
};

export default EditBranches;
