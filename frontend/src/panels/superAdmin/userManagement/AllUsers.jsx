import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    useTheme,
    CircularProgress,
    Alert,
    Chip,
    Badge,
    Modal,
    IconButton,
    useMediaQuery,
} from '@mui/material';
// import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import { DataGrid } from '@mui/x-data-grid';
import { tokens } from '../../../theme';
import Header from '../../../components/Header';
import { getDataFunc } from '../../../utils/services';
import { toast } from 'react-hot-toast';
import { DataGridStyles } from '../../../utils/DataGridStyles';
import { UserContextHook } from '../../../contexts/UserContexts';
import { ScrollableForm } from '../hospitalManagement/editHospital';
// import UserFormAdmin from '../userManagementAdmin/UserFormAdmin';
import UpdatePasswordForm from './UpdatePassword';

const AllUsers = () => {
    const { currentUser } = UserContextHook();
    const typeOfUser = currentUser?.type || 'N/A';
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paginationModel, setPaginationModel] = useState({
        pageSize: 15,
        page: 0,
    });
    // const [editModalOpen, setEditModalOpen] = useState(false);
    // const [selectedUser, setSelectedUser] = useState(null);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);

    // Fetch all users
    const fetchAllUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await getDataFunc('getAllUsers');

            if (response.success) {
                // Add unique IDs if not present
                const usersWithIds = response.data.map((user, index) => ({
                    ...user,
                    //   id: user._id || user.id || index,
                }));
                setUsers(usersWithIds);
            } else {
                setError(response.message || 'Failed to fetch users');
                toast.error(response.message || 'Failed to fetch users');
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('An error occurred while fetching users');
            toast.error('An error occurred while fetching users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllUsers();
    }, []);

    // Define columns for DataGrid
    const columns = [
        // Edit user column removed
        {
            field: 'name',
            headerName: 'Name',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {params.value || 'N/A'}
                </Typography>
            ),
        },
        {
            field: 'username',
            headerName: 'Username',
            flex: 1,
            minWidth: 130,
        },
        {
            field: 'email',
            headerName: 'Email',
            flex: 1.5,
            minWidth: 200,
        },
        {
            field: 'type',
            headerName: 'User Type',
            flex: 0.8,
            minWidth: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value || 'N/A'}
                    size="small"
                    sx={{
                        backgroundColor:
                            params.value === 'superadmin' ? colors.blueAccent[600] :
                                params.value === 'admin' ? colors.greenAccent[600] :
                                    params.value === 'supermanager' ? colors.redAccent[600] :
                                        params.value === 'teamLeader' ? colors.orangeAccent[600] :
                                            params.value === 'executive' ? colors.secondary[600] :
                                                colors.grey[600],
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '0.6rem',
                        textTransform: 'capitalize',
                        minWidth: '85px',
                        '& .MuiChip-label': {
                            px: 1.5,
                        },
                    }}
                />
            ),
        },
        {
            field: 'hospitals',
            headerName: 'Hospitals',
            flex: 1.5,
            minWidth: 200,
            renderCell: (params) => {
                // Check hospitalNames first (for admin users)
                const hospitalNames = params.row.hospitalNames;
                if (hospitalNames && Array.isArray(hospitalNames) && hospitalNames.length > 0) {
                    return hospitalNames.join(', ');
                }

                // Check hospitalName (for other user types)
                const hospitalName = params.row.hospitalName;
                if (hospitalName) {
                    if (Array.isArray(hospitalName)) {
                        return hospitalName.length > 0 ? hospitalName.join(', ') : 'N/A';
                    }
                    if (typeof hospitalName === 'string') {
                        return hospitalName;
                    }
                }

                return 'N/A';
            },
        },
        {
            field: 'userCreatedBy',
            headerName: 'Created By',
            flex: 1,
            minWidth: 130,
            renderCell: (params) => (
                <Typography
                    component="span"
                    variant="caption"
                    sx={{
                        backgroundColor: colors.primary[600],
                        color: 'white',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1.5,
                        textTransform: 'capitalize',
                        fontWeight: '600',
                        fontSize: '0.7rem',
                        display: 'inline-block',
                        minWidth: '70px',
                        textAlign: 'center',
                    }}
                >
                    {params.value || 'System'}
                </Typography>
            ),
        },
        {
            field: 'parentUser',
            headerName: 'Parent User',
            flex: 1,
            minWidth: 130,
            renderCell: (params) => (
                <Typography
                    component="span"
                    variant="caption"
                >
                    {params.row.userCreatedBy === "superadmin" ? "superadmin" : params.value}
                </Typography>
            ),
        },
        {
            field: 'isadmin',
            headerName: 'Admin Level',
            flex: 0.8,
            minWidth: 100,
            renderCell: (params) => (
                <span
                    style={{
                        backgroundColor: params.value ? colors.greenAccent[600] : colors.grey[600],
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '0.7rem',
                        display: 'inline-block',
                        minWidth: '40px',
                        textAlign: 'center',
                    }}
                >
                    {params.value ? 'Yes' : 'No'}
                </span>
            ),
        },
        {
            field: 'updatePassword',
            headerName: 'Update Password',
            flex: 0.7,
            minWidth: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <IconButton onClick={() => {
                    setSelectedUserForPassword(params.row);
                    setPasswordModalOpen(true);
                }} color="secondary">
                    <LockResetIcon />
                </IconButton>
            ),
        },
    ];

    if (loading) {
        return (
            <Box m="20px">
                <Header title="ALL USERS" subtitle="Loading users..." />
                <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                    <CircularProgress />
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Box m="20px">
                <Header title="ALL USERS" subtitle="Error loading users" />
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <ScrollableForm>
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%' }}>
                <Header
                    title="ALL USERS"
                    subtitle={`Total Users: ${users.length}`}
                />
                <Box sx={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', ...DataGridStyles(colors, theme) }}>
                    <DataGrid
                        rows={users}
                        columns={columns}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[15, 25, 50, 100]}
                        checkboxSelection={false}
                        disableSelectionOnClick
                        getRowId={(row) => row.ID}
                        style={{ flex: 1, width: '100%', height: '100%' }}
                    />
                </Box>
            </Box>
            {/* Edit User Modal removed */}
            {/* Update Password Modal */}
            <Modal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'transparent', p: 0, borderRadius: 2, minWidth: 350, maxWidth: 600, width: '90%' }}>
                    {selectedUserForPassword && (
                        <UpdatePasswordForm user={selectedUserForPassword} onClose={() => { setPasswordModalOpen(false); setSelectedUserForPassword(null); }} />
                    )}
                </Box>
            </Modal>
        </ScrollableForm>
    );
};

export default AllUsers;