import React from "react";
import { getDataFunc, sendDataApiFunc } from "../../../utils/services";
import { toast, Toaster } from "react-hot-toast";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { styled } from "@mui/system";
import { Box, useMediaQuery, useTheme, IconButton, Modal, CircularProgress, Typography } from "@mui/material";
import { tokens } from "../../../theme";
import Header from "../../../components/Header";
import { DataGridStyles } from "../../../utils/DataGridStyles";
import { nanoid } from "@reduxjs/toolkit";
import { oscillateRotation } from "../../../utils/keyFrameStyles";
import { EditSqureIcon, AddIcon } from "../../../scenes/svgIcons/icons";
import CustomButton from "../../../components/customComponents/Button";
import LockResetIcon from "@mui/icons-material/LockReset";
import DeleteIcon from "@mui/icons-material/Delete";
import UserFormTeamLeader from "./UserFormTeamLeader"; // <-- This is the new form
import { UserContextHook } from "../../../contexts/UserContexts";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import UpdatePasswordForm from "../../superAdmin/userManagement/UpdatePassword";
import { useApi } from "../../../api/useApi";
import { commonRoutes } from "../../../api/apiService";

const ScrollableForm = styled(Box)({
  width: "100%",
  height: "calc(100vh - 100px)",
  overflowY: "auto",
  padding: "2px 20px 10px 20px",
});

function UserManagementTeamLeader() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [userData, setUserData] = React.useState([]); // This will hold the filtered list
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
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { currentUser } = UserContextHook();
  const currentUsername = currentUser?.username;

  const {
    request: getAllUsers,
    loading: userLoading,
    error: usersError,
  } = useApi(commonRoutes.getAllUsers);
  const { request: getMe, error: getMeError, loading: getMeloading } = useApi(commonRoutes.getMe)
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
  React.useEffect(() => {
    const fetchUsers = async () => {
      const res = await getAllUsers(hospitalId);
      setUserData(res.data || []);
      // toast.success(response.message);
    };
    if (hospitalId) {
      fetchUsers();
    }
  }, [hospitalId]);


  const handleAddUserModel = () => {
    setOpen(true);
  };

  const handleCloseUpdatePasswordModal = () => {
    setOpenUpdatePasswordModal(false);
    setSelectedUserForPasswordUpdate(null);
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
    // {
    //   field: "editUser",
    //   headerName: "Edit User",
    //   flex: isSmallScreen ? undefined : 1,
    //   width: isSmallScreen ? 100 : 150,
    //   renderCell: (params) => (
    //     <StyledIconButton
    //       onClick={() => handleOpenUpdateModel(params.row)}
    //       bgColor={colors.secondary[800]}
    //       color={colors.greenAccent[700]}
    //     >
    //       <EditSqureIcon />
    //     </StyledIconButton>
    //   ),
    // },
    // {
    //   field: "updatePassword",
    //   headerName: "Update Password",
    //   flex: isSmallScreen ? undefined : 1,
    //   width: isSmallScreen ? 100 : 150,
    //   renderCell: (params) => (
    //     <StyledIconButton
    //       onClick={() => handleOpenUpdatePasswordModal(params.row)}
    //       bgColor={colors.secondary[800]}
    //       color={colors.orangeAccent[500]}
    //     >
    //       <LockResetIcon />
    //     </StyledIconButton>
    //   ),
    // },
    // {
    //   field: "deleteUser",
    //   headerName: "Delete User",
    //   flex: isSmallScreen ? undefined : 1,
    //   width: isSmallScreen ? 100 : 150,
    //   renderCell: (params) => (
    //     <StyledIconButton
    //       onClick={() => handleOpenDeleteModal(params.row)}
    //       bgColor={colors.secondary[800]}
    //       color={colors.redAccent[500]}
    //     >
    //       <DeleteIcon />
    //     </StyledIconButton>
    //   ),
    // },
  ];

  const userDataInTable = userData.map((user) => ({
    id: nanoid(),
    ...user,
  }));


  React.useEffect(() => {
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
              title="User Management (Team Leader)"
              subtitle="Manage your Executive users"
            />
            <CustomButton icon={<AddIcon />} onClick={handleAddUserModel}>
              Add Executive
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
                <UserFormTeamLeader
                  initialState={null}
                  onClose={() => setOpen(false)}
                  setUserData={setUserData}
                  hospitalId={hospitalId}
                />
              ) : updateOpen && userUpdateData ? (
                <UserFormTeamLeader
                  initialState={userUpdateData}
                  onClose={() => setUpdateOpen(false)}
                  setUserData={setUserData}
                  hospitalId={hospitalId}
                />
              ) : null}
            </Box>
          </Modal>
          {/* 
      <DeleteConfirmationModal
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete user "${selectedUserForDelete?.name || selectedUserForDelete?.username}"? This action cannot be undone.`}
      /> */}

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

export default UserManagementTeamLeader;
