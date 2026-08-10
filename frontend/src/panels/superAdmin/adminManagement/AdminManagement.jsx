import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";

import {
    CircularProgress,
    Box,
    useMediaQuery,
    useTheme,
    IconButton,
    Modal,
    Typography,
    Button,
    TextField,
    Paper,
    Chip,
    Avatar,
    InputAdornment,
    Stack,
} from "@mui/material";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
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
import UpdatePasswordForm from "../userManagement/UpdatePassword";
import HospitalContext from "../../../contexts/HospitalContexts";
import BreadcrumbNav from "../../../components/BroadcrumNav.jsx";
import { useApi } from "../../../api/useApi";
import { superAdminRoutes } from "../../../api/apiService";

// --- Styled Components ---
const RootContainer = styled(Box)(({ theme }) => ({
    backgroundColor: "#F8FAFC",
    minHeight: "100vh",
    padding: theme.spacing(3, 4),
    fontFamily: "'Inter', sans-serif",
}));

const ActionIconButton = styled(IconButton)(({ bg, hoverBg, color }) => ({
    backgroundColor: bg || "#F1F5F9",
    color: color || "#475569",
    borderRadius: "8px",
    padding: "6px",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
        backgroundColor: hoverBg || "#E2E8F0",
    },
}));

// Role Chip Colors mapping to match design
const getRoleChipStyle = (role) => {
    const normalized = (role || "").toLowerCase();
    if (normalized.includes("regional") || normalized.includes("super")) {
        return { bgcolor: "#DBEAFE", color: "#1E40AF" };
    }
    if (normalized.includes("facility") || normalized.includes("admin")) {
        return { bgcolor: "#E0F2FE", color: "#0369A1" };
    }
    return { bgcolor: "#EFF6FF", color: "#2563EB" };
};

function AdminManagement() {
    const theme = useTheme();
    const [userUpdateData, setUserUpdateData] = useState(null);
    const [open, setOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteUserId, setDeleteUserId] = useState(null);

    const [openUpdatePasswordModal, setOpenUpdatePasswordModal] = useState(false);
    const [selectedUserForPasswordUpdate, setSelectedUserForPasswordUpdate] =
        useState(null);

    const [paginationModel, setPaginationModel] = useState({
        pageSize: 15,
        page: 0,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const { loading, errors, admins, refetchAdmins } = useContext(HospitalContext);

    const {
        request: deleteUserById,
        loading: deleteLoading,
        error: deleteError,
    } = useApi(superAdminRoutes.deleteUser);

    const deleteUser = async () => {
        const res = await deleteUserById(deleteUserId);
        if (res?.success) {
            await refetchAdmins();
            setDeleteOpen(false);
            setDeleteUserId(null);
            toast.success("User Deleted");
        }
    };

    const handleDeleteUser = async (userId) => {
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
                const role = params.row?.type || "Admin";
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
            field: "actions",
            headerName: "ACTIONS",
            width: 150,
            sortable: false,
            filterable: false,
            align: "right",
            headerAlign: "right",
            renderCell: (params) => (
                <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center" width="100%">
                    <ActionIconButton
                        onClick={() => handleOpenUpdateModel(params.row)}
                        bg="transparent"
                        hoverBg="#EFF6FF"
                        color="#2563EB"
                        title="Edit User"
                    >
                        <EditOutlinedIcon fontSize="small" />
                    </ActionIconButton>

                    <ActionIconButton
                        onClick={() => handleOpenUpdatePasswordModal(params.row)}
                        bg="transparent"
                        hoverBg="#F1F5F9"
                        color="#475569"
                        title="Reset Password"
                    >
                        <LockResetIcon fontSize="small" />
                    </ActionIconButton>

                    <ActionIconButton
                        onClick={() => handleDeleteUser(params?.row?.id)}
                        bg="transparent"
                        hoverBg="#FEF2F2"
                        color="#EF4444"
                        title="Delete User"
                    >
                        <DeleteOutlineIcon fontSize="small" />
                    </ActionIconButton>
                </Stack>
            ),
        },
    ];

    const filteredUserData = (admins || []).filter((user) =>
        user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const adminsInTable = filteredUserData.map((user) => ({
        id: user._id || nanoid(),
        ...user,
    }));

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
                            allUsers={admins}
                            refetchAdmins={refetchAdmins}
                            isInline={true}
                        />
                    ) : (
                        <UserForm
                            initialState={userUpdateData}
                            onClose={() => setUpdateOpen(false)}
                            allUsers={admins}
                            refetchAdmins={refetchAdmins}
                            isInline={true}
                        />
                    )}
                </Paper>
            </RootContainer>
        );
    }

    return (
        <RootContainer>
            {/* 1. HEADER SECTION */}
            <Box mb={3}>
                <Chip
                    label="SYSTEM ADMINISTRATION"
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
                            Admin <span style={{ color: "#0256E8" }}>Management</span>
                        </Typography>
                        <Typography variant="body2" color="#64748B" mt={0.5}>
                            Direct oversight of clinical platform administrators and access tiers.
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddUserModel}
                        sx={{
                            borderRadius: "20px",
                            backgroundColor: "#003896",
                            textTransform: "uppercase",
                            fontWeight: 700,
                            px: 3,
                            py: 1,
                            fontSize: "11px",
                            letterSpacing: "0.5px",
                            boxShadow: "none",
                            "&:hover": { backgroundColor: "#00286B", boxShadow: "none" },
                        }}
                    >
                        ADD USER
                    </Button>
                </Box>
            </Box>

            {/* 2. TABLE TOOLBAR CONTROL BAR */}
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
                        FILTER
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

                <TextField
                    size="small"
                    placeholder="Search..."
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
                        width: 240,
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "20px",
                            backgroundColor: "#F8FAFC",
                            fontSize: "12px",
                            "& fieldset": { borderColor: "#E2E8F0" },
                        },
                    }}
                />
            </Paper>

            {/* 3. DATAGRID CONTAINER */}
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
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        height="300px"
                    >
                        <CircularProgress size={36} sx={{ color: "#0256E8", mb: 2 }} />
                        <Typography variant="body2" color="#64748B">
                            Loading admins data...
                        </Typography>
                    </Box>
                ) : (
                    <DataGrid
                        rows={adminsInTable}
                        columns={columns}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[15, 25, 50]}
                        autoHeight
                        rowHeight={56}
                        sx={{
                            border: "none",
                            "& .MuiDataGrid-columnHeaders": {
                                backgroundColor: "#F8FAFC",
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

            {/* 4. FOOTER CREDENTIALS */}
            <Box display="flex" justifyContent="space-between" alignItems="center" px={1}>
                <Typography variant="caption" color="#94A3B8" fontWeight={600} fontSize="10px">
                    INFINIS ENTERPRISE V2.4.12 • ISO 27001 CERTIFIED
                </Typography>

                <Box display="flex" alignItems="center" gap={0.5}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#10B981" }} />
                    <Typography variant="caption" color="#64748B" fontWeight={700} fontSize="10px">
                        SECURE SYNC
                    </Typography>
                </Box>
            </Box>

            {/* Password Update Modal */}
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
                        width: isSmallScreen ? 320 : 480,
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
                confirmText={
                    deleteLoading ? <CircularProgress size={18} sx={{ color: "#FFF" }} /> : "Delete"
                }
                cancelText="Cancel"
                confirmDisabled={deleteLoading}
            />
        </RootContainer>
    );
}

export default AdminManagement;