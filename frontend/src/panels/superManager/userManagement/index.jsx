import React, { useEffect } from "react";
import { getDataFunc, sendDataApiFunc } from "../../../utils/services";
import { toast, Toaster } from "react-hot-toast";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { gridClasses, styled } from "@mui/system";
import { Box, useMediaQuery, useTheme, IconButton, Modal, CircularProgress, Typography } from "@mui/material";
import { tokens } from "../../../theme";
import Header from "../../../components/Header";
import { DataGridStyles } from "../../../utils/DataGridStyles";
import { nanoid } from "@reduxjs/toolkit";
import CustomButton from "../../../components/customComponents/Button";
import { AddIcon } from "../../../scenes/svgIcons/icons";
import UserFormSupermanager from "./userForms";
import UpdatePasswordForm from "../../superAdmin/userManagement/UpdatePassword";
import { useApi } from "../../../api/useApi";
import { commonRoutes } from "../../../api/apiService";

const ScrollableForm = styled(Box)({
  width: "100%",
  height: "calc(100vh - 100px)",
  overflowY: "auto",
  padding: "2px 20px 10px 20px",
});

function UserManagementSupermanager() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [userData, setUserData] = React.useState([]); // For the table
  const [allUsers, setAllUsers] = React.useState([]); // For the form dropdowns
  const [userUpdateData, setUserUpdateData] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [updateOpen, setUpdateOpen] = React.useState(false);
  const [profile, setProfile] = React.useState(null);
  const [hospitalId, setHospitalId] = React.useState(null)
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

  const { request: getMe, error: getMeError, loading: getMeloading } = useApi(commonRoutes.getMe)
  const {
    request: getAllUsers,
    loading: userLoading,
    error: usersError,
  } = useApi(commonRoutes.getAllUsers)



  React.useEffect(() => {
    const handleGetMe = async () => {
      const res = await getMe();
      setProfile(res.data || {});
      if (res.data?.hospitals?.length) {
        setHospitalId(res.data?.hospitals[0]?.hospitalId)
      }

      // setIsShowAction(res?.data?.canDelete);
      // toast.success(response.message);
    };
    handleGetMe()
  }, [])

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // ---
  // 2. UPDATED LOGIC TO HANDLE STRING & ARRAY PARENTS
  // ---


  React.useEffect(() => {
    const fetchUsers = async () => {
      const res = await getAllUsers(hospitalId);
      setAllUsers(res.data || []);
      // toast.success(response.message);
    };
    if (hospitalId) {
      fetchUsers();
    }

  }, [hospitalId]);

  const StyledIconButton = styled(IconButton)(({ bgColor, color }) => ({
    backgroundColor: bgColor,
    color: color,
    "&:hover": {
      backgroundColor: bgColor,
      filter: "brightness(0.9)",
    },
    marginLeft: "15px",
    borderRadius: "8px",
    padding: "8px",
  }));

  const handleAddUserModel = () => {
    setOpen(true);
  };

  const handleCloseUpdatePasswordModal = () => {
    setOpenUpdatePasswordModal(false);
    setSelectedUserForPasswordUpdate(null);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedUserForDelete(null);
  };

  // const handleDeleteUser = async () => {
  //   if (selectedUserForDelete) {
  //     try {
  //       const response = await sendDataApiFunc(
  //         `deleteUser/${selectedUserForDelete.ID}`,
  //         {},
  //         "delete",
  //       );
  //       if (response.success) {
  //         toast.success("User deleted successfully");
  //         setUserData((prev) =>
  //           prev.filter((user) => user.ID !== selectedUserForDelete.ID),
  //         );
  //       } else {
  //         toast.error(response.message || "Failed to delete user");
  //       }
  //     } catch (error) {
  //       console.error("Error deleting user:", error);
  //       toast.error("Error deleting user");
  //     }
  //     handleCloseDeleteModal();
  //   }
  // };

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "username", headerName: "Username", flex: 1 },
    { field: "type", headerName: "Role", flex: 1 },
    { field: "email", headerName: "Email", flex: 1.5 },
    // Edit
    // {
    //   field: "edit",
    //   headerName: "Edit",
    //   flex: 0.5,
    //   renderCell: (params) => {
    //     return (
    //       <StyledIconButton
    //         bgColor="rgba(217, 242, 237, 1)"
    //         color="rgba(33, 163, 102, 1)"
    //         onClick={() => handleOpenUpdateModel(params.row)}
    //       >
    //         {/* Using a generic Edit icon or text since the specific icon import was commented out in provided snippet */}
    //         <span style={{ fontSize: "1rem", fontWeight: "bold" }}>✎</span>
    //       </StyledIconButton>
    //     );
    //   },
    // },
    // Update Password
    // {
    //   field: "updatePassword",
    //   headerName: "Update Password",
    //   flex: 0.8,
    //   renderCell: (params) => (
    //     <StyledIconButton
    //       bgColor="rgba(255, 244, 229, 1)"
    //       color="rgba(255, 152, 0, 1)"
    //       onClick={() => handleOpenUpdatePasswordModal(params.row)}
    //     >
    //       <LockResetIcon />
    //     </StyledIconButton>
    //   ),
    // },
    // Delete
    // {
    //   field: "delete",
    //   headerName: "Delete",
    //   flex: 0.5,
    //   renderCell: (params) => (
    //     <StyledIconButton
    //       bgColor="rgba(255, 235, 238, 1)"
    //       color="rgba(211, 47, 47, 1)"
    //       onClick={() => handleOpenDeleteModal(params.row)}
    //     >
    //       <DeleteIcon />
    //     </StyledIconButton>
    //   ),
    // },
  ];

  const userDataInTable = allUsers.map((user) => {
    return {
      id: nanoid(),
      ...user,
    };
  });

  useEffect(() => {
    const error = usersError || getMeError
    if (error) {
      toast.error(error)
    }
  }, [usersError, getMeError])

  return (
    <ScrollableForm>
      {userLoading && (
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
      {!userLoading && (
        <>
          <Box
            display="flex"
            flexDirection={isSmallScreen ? "column" : "row"}
            alignItems={isSmallScreen ? "flex-start" : "center"}
            justifyContent={isSmallScreen ? "flex-start" : "space-between"}
            gap={isSmallScreen ? 2 : 0}
          >
            <Header
              title="User Management (Super Manager)"
              subtitle={"Manage your Team Leaders and Executives"}
            />
            <CustomButton icon={<AddIcon />} onClick={handleAddUserModel}>
              Add Users
            </CustomButton>
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
              {open ? (
                <UserFormSupermanager
                  initialState={null}
                  onClose={() => setOpen(false)}
                  allUsers={allUsers}
                  setAllUsers={setAllUsers}
                  hospitalId={hospitalId}
                />
              ) : updateOpen && userUpdateData ? (
                <UserFormSupermanager
                  initialState={userUpdateData}
                  onClose={() => setUpdateOpen(false)}
                  allUsers={allUsers}
                  setAllUsers={setAllUsers}
                  hospitalId={hospitalId}
                />
              ) : null}
            </Box>
          </Modal>

          {/* Delete Confirmation Modal */}
          {/* <DeleteConfirmationModal
            open={openDeleteModal}
            onClose={handleCloseDeleteModal}
            onConfirm={handleDeleteUser}
            title="Delete User"
            content="Are you sure you want to delete this user? This action cannot be undone."
          /> */}

          {/* Update Password Modal */}
          <Modal
            open={openUpdatePasswordModal}
            onClose={handleCloseUpdatePasswordModal}
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: colors.primary[800],
                borderRadius: 2,
                boxShadow: 24,
                p: 4,
                width: 400,
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

export default UserManagementSupermanager;
