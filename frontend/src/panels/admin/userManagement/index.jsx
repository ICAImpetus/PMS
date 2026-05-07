import React, { useContext, useEffect, useState } from "react";
import { getDataFunc, sendDataApiFunc } from "../../../utils/services";
import { toast, Toaster } from "react-hot-toast";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { gridClasses, styled } from "@mui/system";

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
import LockResetIcon from "@mui/icons-material/LockReset";
import DeleteIcon from "@mui/icons-material/Delete";
import UserFormAdmin from "./UserFormAdmin";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import UpdatePasswordForm from "../../superAdmin/userManagement/UpdatePassword";
import { UserContextHook } from "../../../contexts/UserContexts";
import HospitalContext from "../../../contexts/HospitalContexts";

const ScrollableForm = styled(Box)({
  width: "100%",
  height: "calc(100vh - 100px)", // Adjust height as needed
  overflowY: "auto",
  padding: "2px 20px 10px 20px", // Top, Right, Bottom, Left
});

function UserManagentAdmin() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { currentUser } = UserContextHook()
  const canDelete = currentUser?.canDelete;
  const [userUpdateData, setUserUpdateData] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [isSuperManager, setIsSuperManager] = React.useState(null);
  const [updateOpen, setUpdateOpen] = React.useState(false);
  const [openUpdatePasswordModal, setOpenUpdatePasswordModal] =
    React.useState(false);
  const [selectedUserForPasswordUpdate, setSelectedUserForPasswordUpdate] =
    React.useState(null);
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] =
    React.useState(null);
  const [paginationModel, setPaginationModel] = React.useState({
    pageSize: 15,
    page: 0,
  });
  const [searchTerm, setSearchTerm] = React.useState("");
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));


  const {
    hospitals,
    loading,
    selectedHostpital,
    errors,
    userData,
    setSelectedHostpital,
    refetchUsers
  } = useContext(HospitalContext);


  useEffect(() => {
    if (userData.length > 0) {
      const superManager = userData.find(user => user.type === "supermanager");
      setIsSuperManager(superManager || null);
    } else {
      setIsSuperManager(null)
    }
  }, [userData])

  useEffect(() => {
    const error = errors?.usersError;
    if (error) {
      toast.error(error || "Internal Server Error");
    }
  }, [errors?.usersError]);
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
    console.log("row data is :", row);
    const { id, ...rest } = row;
    console.log("rest is :", rest);
    setUserUpdateData(rest);
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

  const handleOpenDeleteModal = (user) => {
    setSelectedUserForDelete(user);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedUserForDelete(null);
  };

  const handleDeleteUser = async () => {
    if (!selectedUserForDelete) return;
    try {
      const response = await sendDataApiFunc(
        `deleteUser/${selectedUserForDelete._id}`,
        {},
        "delete",
      );
      if (response.success) {
        toast.success("User deleted successfully");
        if (refetchUsers) await refetchUsers()
      } else {
        toast.error(response.message || "Failed to delete user");
      }
    } catch (error) {
      console.log("Error deleting user:", error);
      toast.error("Error deleting user");
    } finally {
      handleCloseDeleteModal();
    }
  };

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: isSmallScreen ? undefined : 1,
      width: isSmallScreen ? 170 : 170,
      valueGetter: (params) => params.row?.name || "Na",
    },
    {
      field: "username",
      headerName: "Username",
      flex: isSmallScreen ? undefined : 1,
      width: isSmallScreen ? 170 : 170,
      valueGetter: (params) => params.row?.username || "",
    },
    {
      field: "type",
      headerName: "Role",
      flex: isSmallScreen ? undefined : 1,
      width: isSmallScreen ? 170 : 170,
      valueGetter: (params) => params.row?.type,
    },
    {
      field: "email",
      headerName: "Email",
      flex: isSmallScreen ? undefined : 1,
      width: isSmallScreen ? 170 : 170,
      valueGetter: (params) => params.row?.email || "",
    },
    {
      field: "editUser",
      headerName: "Edit User",
      width: isSmallScreen ? 100 : 150,
      renderCell: (params) => (
        <StyledIconButton
          onClick={() => handleOpenUpdateModel(params.row)}
          bgColor={colors.secondary[800]}
          color={colors.greenAccent[700]}
        >
          <EditSqureIcon />
        </StyledIconButton>
      ),
    },
    {
      field: "updatePassword",
      headerName: "Update Password",
      width: isSmallScreen ? 100 : 150,
      renderCell: (params) => (
        <StyledIconButton
          onClick={() => handleOpenUpdatePasswordModal(params.row)}
          bgColor={colors.secondary[800]}
          color={colors.orangeAccent[500]}
        >
          <LockResetIcon />
        </StyledIconButton>
      ),
    },

    ...(canDelete
      ? [
        {
          field: "deleteUser",
          headerName: "Delete User",
          width: isSmallScreen ? 100 : 150,
          renderCell: (params) => (
            <Tooltip title="Delete Record">
              <span>
                <StyledIconButton
                  onClick={() =>
                    handleOpenDeleteModal(params.row)
                  }
                  bgColor={colors.secondary[800]}
                  color={colors.redAccent[500]}
                >
                  <DeleteIcon />
                </StyledIconButton>
              </span>
            </Tooltip>
          ),
        },
      ]
      : []),
  ];
  const userDataInTable = userData.map((user) => {
    return {
      id: nanoid(),
      ...user,
    };
  });

  return (
    <ScrollableForm>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            zIndex: 999999,
          },
        }}
      />
      {loading?.users && (
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
      {!loading?.users && (
        <>


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
            <Box display="flex" gap={1} alignItems="center">
              <FormControl sx={{ width: '220px' }} size="small">
                {/* <InputLabel id="hospital-label">Select Hospital</InputLabel> */}

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
                  width: 200,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: colors.primary[900],
                    "&:hover fieldset": {
                      borderColor: colors.blueAccent[500],
                    },
                  },
                }}
              />

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

                  sx={{ width: isSmallScreen ? "100%" : "auto" }}
                >
                  Add Users
                </CustomButton>
              </Box>

            </Box>
          </Box>
          <Box m="4px 0 0 0" height="80vh" sx={DataGridStyles(colors, theme)}>
            <DataGrid
              rows={userDataInTable}
              columns={columns}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              style={{ width: "90vh" }}
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
                backgroundColor: colors.primary[800],
                borderRadius: 2,
              }}
            >
              {/* Pass the allUsers list to the form */}
              {open ? (
                <UserFormAdmin
                  initialState={null}
                  onClose={() => setOpen(false)}
                  allUsers={userData}
                  refetchUsers={refetchUsers}
                  hospitalId={selectedHostpital}
                  anyFieldDisabled={isSuperManager}
                />
              ) : updateOpen && userUpdateData ? (
                <UserFormAdmin
                  initialState={userUpdateData}
                  onClose={() => setUpdateOpen(false)}
                  allUsers={userData}
                  refetchUsers={refetchUsers}
                  hospitalId={selectedHostpital}
                  anyFieldDisabled={isSuperManager}
                />
              ) : null}
            </Box>
          </Modal>

          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal
            open={openDeleteModal}
            onClose={handleCloseDeleteModal}
            onConfirm={handleDeleteUser}
            title="Delete User"
            message={`Are you sure you want to delete user "${selectedUserForDelete?.name || selectedUserForDelete?.username}"? This action cannot be undone.`}
          />

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
        </>
      )

      }

    </ScrollableForm>
  );
}

export default UserManagentAdmin;
