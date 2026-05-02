import React, { useContext, useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { styled } from "@mui/system";

import {
  FormControl,
  Tooltip,
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
} from "@mui/material";
import { tokens } from "../../../theme";
import Header from "../../../components/Header";
import { DataGridStyles } from "../../../utils/DataGridStyles";
import { nanoid } from "@reduxjs/toolkit";
import { oscillateRotation } from "../../../utils/keyFrameStyles";
import { EditSqureIcon } from "../../../scenes/svgIcons/icons";
import CustomButton from "../../../components/customComponents/Button";
import { AddIcon } from "../../../scenes/svgIcons/icons";
// import { DeleteIcon } from "../svgIcons/icons"; // Import your delete
import DeleteIcon from "@mui/icons-material/Delete"; // Example import for an icon
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import LockResetIcon from "@mui/icons-material/LockReset"; // Example import for an icon
import UserForm from "./UserForm";
import UpdatePasswordForm from "./UpdatePassword";
import { useApi } from "../../../api/useApi";
import { commonRoutes, superAdminRoutes } from "../../../api/apiService";
import { useLocation } from "react-router-dom";
import HospitalContext from "../../../contexts/HospitalContexts";

const ScrollableForm = styled(Box)({
  width: "100%",
  height: "calc(100vh - 100px)", // Adjust height as needed based on your layout
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  padding: "2px 20px 10px 20px", // Top, Right, Bottom, Left
  // Hide scrollbars
  "&::-webkit-scrollbar": {
    display: "none", // Hide scrollbar for WebKit browsers
  },
  scrollbarWidth: "none", // Hide scrollbar for Firefox
  "-ms-overflow-style": "none", // Hide scrollbar for IE/Edge
});

function UserManageMent() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const location = useLocation()
  const [userUpdateData, setUserUpdateData] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [updateOpen, setUpdateOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteUserId, setDeleteUserId] = React.useState(null);
  const [isSuperManager, setIsSuperManager] = React.useState(null);
  const [openUpdatePasswordModal, setOpenUpdatePasswordModal] =
    React.useState(false);
  const [selectedUserForPasswordUpdate, setSelectedUserForPasswordUpdate] =
    React.useState(null);
  const [paginationModel, setPaginationModel] = React.useState({
    pageSize: 15,
    page: 0,
  });
  const [searchTerm, setSearchTerm] = React.useState("");
  // console.log("colors grey is :", colors.grey);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // Checks for screens below 'sm' breakpoint (600px)


  const {
    request: deleteUserById,
    loading: deleteLoading,
    error: deleteError,
  } = useApi(superAdminRoutes.deleteUser);


  const {
    hospitals,
    loading,
    selectedHostpital,
    errors,
    userData,
    setSelectedHostpital,
  } = useContext(HospitalContext);


  useEffect(() => {
    if (location?.state?.selectedHostpital) {
      setSelectedHostpital(location?.state?.selectedHostpital)
    }
  }, [location?.state?.selectedHostpital])

  useEffect(() => {
    if (userData.length > 0) {
      const superManager = userData.find(user => user.type === "supermanager");
      setIsSuperManager(superManager || null);
    } else {
      setIsSuperManager(null)
    }
  }, [userData])

  const deleteUser = async () => {
    await deleteUserById(deleteUserId);
    setUserData((prev) => prev.filter((item) => item._id !== deleteUserId));
    setDeleteOpen(false);
    setDeleteUserId(null);
    toast.success("User Deleted");
  };

  const handleDeleteUser = async (userId) => {
    console.log("Deleting user with ID:", userId);
    // deleteUser(userId)
    setDeleteUserId(userId);
    setDeleteOpen(true);
  };

  const StyledIconButton = styled(IconButton)(({ bgColor, color }) => ({
    transition: "background-color 0.3s",
    backgroundColor: bgColor, // Initial background color
    color,
    "&:hover": {
      backgroundColor: colors.primary[900], // Background color on hover
      color, // Icon color on hover
      animation: "oscillate 0.5s ease-in-out infinite", // Apply oscillation animation
    },
    "@keyframes oscillate": oscillateRotation,
  }));

  const handleOpenUpdateModel = (row) => {
    // console.log("row data is :", row);
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
    setSelectedUserForPasswordUpdate(null); // Clear data on close
  };

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: isSmallScreen ? undefined : 1,
      width: isSmallScreen ? 170 : 170,
      valueGetter: (params) => {
        return params.row?.name || "Na";
      },
    },
    // {
    {
      field: "username",
      headerName: "Username",
      flex: isSmallScreen ? undefined : 1,
      width: isSmallScreen ? 170 : 170,
      valueGetter: (params) => {
        return params.row?.username || ""; // Returns callmenuname or an empty string if not found
      },
    },

    {
      field: "type",
      headerName: "Role",
      flex: isSmallScreen ? undefined : 1,
      width: isSmallScreen ? 170 : 170,
      valueGetter: (params) => {
        return params.row?.type;
      },
    },
    {
      field: "email",
      headerName: "Email",
      flex: isSmallScreen ? undefined : 1,
      width: isSmallScreen ? 170 : 170,
      valueGetter: (params) => {
        return params.row?.email || ""; // Returns callmenuname or an empty string if not found
      },
    },
    {
      field: "editUser",
      headerName: "Edit User",
      flex: isSmallScreen ? undefined : 1,
      width: isSmallScreen ? 100 : 150,
      renderCell: (params) => {
        return (
          <StyledIconButton
            onClick={() => handleOpenUpdateModel(params.row)}
            bgColor={colors.secondary[800]}
            color={colors.greenAccent[700]}
          >
            <EditSqureIcon />
          </StyledIconButton>
        );
      },
    },
    // --- New Column for Update Password ---
    {
      field: "updatePassword", // A unique ID for this column
      headerName: "Update Password", // The text displayed in the header
      flex: isSmallScreen ? undefined : 1,
      width: isSmallScreen ? 100 : 150, // Adjust width as needed for responsiveness
      renderCell: (params) => {
        return (
          <StyledIconButton
            onClick={() => handleOpenUpdatePasswordModal(params.row)} // Call a new handler for password updates
            bgColor={colors.secondary[800]} // Using a consistent background color
            color={colors.orangeAccent[500]} // Example: a distinct color for password action
          >
            <LockResetIcon />{" "}
          </StyledIconButton>
        );
      },
    },
    {
      field: "deleteUser",
      headerName: "Delete User",
      flex: isSmallScreen ? undefined : 1,
      width: isSmallScreen ? 100 : 150,
      renderCell: (params) => {
        return (
          <StyledIconButton
            onClick={() => handleDeleteUser(params?.row?.id)}
            bgColor={colors.secondary[800]}
            color={colors.redAccent[500]}
          >
            <DeleteIcon />
          </StyledIconButton>
        );
      },
    },
  ];

  // Filter users based on search term (search by name only)
  const filteredUserData = userData.filter((user) =>
    user?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const userDataInTable = filteredUserData.map((user) => {
    return {
      id: user._id || nanoid(),
      ...user,
    };
  });
  // };


  useEffect(() => {
    const error = deleteError || errors?.usersError || null;
    if (error) {
      toast.error(error || "Internal Server Error");
    }
  }, [deleteError, errors?.usersError]);

  return (
    <ScrollableForm>
      {/* Loader */}
      {loading?.userLoading && (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          height="400px"
        >
          <CircularProgress
            size={40}
            sx={{ color: colors.blueAccent[500], mb: 2 }}
          />
          <Typography variant="body1" color="textSecondary">
            Loading users...
          </Typography>
        </Box>
      )}

      {/* Main Content */}
      {!loading?.userLoading && (
        <>
          {/* <Toaster position="top-right" reverseOrder={false} /> */}
          <Box
            display="flex"
            flexDirection={isSmallScreen ? "column" : "row"}
            alignItems={isSmallScreen ? "flex-start" : "center"}
            justifyContent={isSmallScreen ? "flex-start" : "space-between"}
            gap={isSmallScreen ? 2 : 0}
          >
            <Header
              title="User Managements"
              subtitle={"Users List in Superadmin Panel"}
            />
            <Box
              display="flex"
              gap={1}
              alignItems="center"
              flexWrap={isSmallScreen ? "wrap" : "nowrap"}
              sx={{ width: isSmallScreen ? "100%" : "auto" }}
            >
              <FormControl sx={{ width: isSmallScreen ? "100%" : "220px" }} size="small">
                {/* <Select Component ... */}
                <Select
                  value={selectedHostpital}
                  onChange={(e) => setSelectedHostpital(e.target.value)}
                  disabled={loading?.hospitalsLoading}
                  displayEmpty
                  sx={{
                    borderRadius: 2,
                    color: "black",
                    "&.Mui-focused": {
                      color: "black",
                    },
                    backgroundColor: "#fff"
                  }}
                >
                  {loading?.hospitalsLoading ? (
                    <MenuItem value="">
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading...
                    </MenuItem>
                  ) : hospitals.length > 0 ? (
                    hospitals.map((hospital) => (
                      <MenuItem key={hospital._id} value={hospital._id}>
                        {hospital.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="">No hospitals Are Found</MenuItem>
                  )}
                </Select>
              </FormControl>

              <TextField
                size="small"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  width: isSmallScreen ? "100%" : 200,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: colors.primary[900],
                    "&:hover fieldset": {
                      borderColor: colors.blueAccent[500],
                    },
                  },
                }}
              />
              <Tooltip
                title={
                  isSuperManager !== null
                    ? "You already created a super manager for this hospital"
                    : ""
                }
              >
                <span>
                  <Box
                    sx={{
                      width: isSmallScreen ? "100%" : "auto",
                      display: "flex",
                      justifyContent: isSmallScreen ? "flex-end" : "flex-start"
                    }}
                  >
                    <CustomButton
                      data-testid="adduserbtn"
                      icon={<AddIcon />}
                      onClick={handleAddUserModel}
                      disabled={!selectedHostpital || isSuperManager !== null}
                      sx={{ width: isSmallScreen ? "100%" : "auto" }}
                    >
                      Add Users
                    </CustomButton>
                  </Box>
                </span>
              </Tooltip>
            </Box>
          </Box>
          <Box
            sx={{
              flex: 1,
              minHeight: 400,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              ...DataGridStyles(colors, theme),
            }}
          >
            <DataGrid
              rows={userDataInTable}
              columns={columns}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              style={{ flex: 1, width: "100%", height: "100%" }}
              pageSizeOptions={[15, 25, 50, 100]}
              components={{ Toolbar: GridToolbar }}
            />
          </Box>
          <Modal
            open={open || updateOpen}
            onClose={() => setOpen(false) || setUpdateOpen(false)}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                // width: 4 ? 400 : isSmallScreen ? 300 : 600,
                backgroundColor: colors.primary[800],
                // p: 0.5,
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              {open ? (
                // ---
                // 2. PASSING 'allUsers' PROP TO THE FORM
                // ---
                <UserForm
                  initialState={null}
                  onClose={() => setOpen(false)}
                  allUsers={userData}
                  setUserData={setUserData}
                  hospitalId={selectedHostpital}
                  setError={toast.error}

                // Pass the full user list
                />
              ) : updateOpen && userUpdateData ? (
                <UserForm
                  initialState={userUpdateData}
                  onClose={() => setUpdateOpen(false)}
                  allUsers={userData} // Also pass it for updates
                  setUserData={setUserData}
                  hospitalId={selectedHostpital}
                  setError={toast.error}
                />
              ) : null}
            </Box>
          </Modal>
          {/* Update Password Modal */}
          <Modal
            open={openUpdatePasswordModal}
            onClose={handleCloseUpdatePasswordModal}
            aria-labelledby="password-modal-title"
            aria-describedby="password-modal-description"
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: isSmallScreen ? 300 : 500,
                backgroundColor: colors.primary[800],
                p: 2,
                borderRadius: 2,
                // color: "white", // Ensure text is visible on dark background
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

          <DeleteConfirmationModal
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            onConfirm={() => deleteUser()}
            title="Confirm Deletion"
            message="Are you sure you want to delete this user?"
            confirmText="Delete"
            cancelText="Cancel"
          />
        </>
      )}
    </ScrollableForm>
  );
}

export default UserManageMent;
