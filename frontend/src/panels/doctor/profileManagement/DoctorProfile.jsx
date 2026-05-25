import React, { useState } from "react";
import {
    Box,
    Container,
    Paper,
    TextField,
    Button,
    Grid,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Typography,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
    PhotoCamera as PhotoCameraIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
} from "@mui/icons-material";
import { tokens } from "../../../theme";
import { UserContextHook } from "../../../contexts/UserContexts";
import toast from "react-hot-toast";

const DoctorProfile = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { currentUser } = UserContextHook();
    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState(currentUser?.profilePicture || "");
    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [formData, setFormData] = useState({
        fullName: currentUser?.name || "",
        doctorId: currentUser?._id || "DOC-001",
        specialization: currentUser?.specialization || "General Medicine",
        qualification: currentUser?.qualification || "MBBS, MD",
        experience: currentUser?.experience || "10 years",
        email: currentUser?.email || "doctor@hospital.com",
        contactNumber: currentUser?.contactNumber || "+91-9876543210",
        licenseNumber: currentUser?.licenseNumber || "MCI-123456",
        bio: currentUser?.bio || "",
        hospital: currentUser?.hospital || "City Medical Center",
        department: currentUser?.department || "Internal Medicine",
    });

    const [editData, setEditData] = useState(formData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = () => {
        setFormData(editData);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
    };

    const handleCancel = () => {
        setEditData(formData);
        setIsEditing(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setProfileImage(event.target.result);
                setOpenImageDialog(false);
                toast.success("Profile picture updated!");
            };
            reader.readAsDataURL(file);
        }
    };

    const ProfileSection = ({ title, children }) => (
        <Card sx={{ backgroundColor: colors.primary[400], mb: 3 }}>
            <CardHeader
                title={title}
                titleTypographyProps={{ color: colors.gray[100] }}
                sx={{ pb: 1 }}
            />
            <Divider sx={{ borderColor: colors.primary[500] }} />
            <CardContent>{children}</CardContent>
        </Card>
    );

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Header */}
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h3" color={colors.gray[100]} fontWeight="bold" mb={1}>
                        My Profile
                    </Typography>
                    <Typography color={colors.gray[300]} variant="body1">
                        Manage your professional information and credentials
                    </Typography>
                </Box>
                <Button
                    variant={isEditing ? "outlined" : "contained"}
                    startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
                    onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
                    sx={{
                        color: isEditing ? colors.redAccent[400] : "inherit",
                        borderColor: isEditing ? colors.redAccent[400] : "inherit",
                    }}
                >
                    {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
            </Box>

            {/* Profile Picture Section */}
            <ProfileSection title="Profile Picture">
                <Box display="flex" justifyContent="center" mb={2}>
                    <Box position="relative">
                        <Avatar
                            src={profileImage}
                            alt={formData.fullName}
                            sx={{
                                width: 150,
                                height: 150,
                                fontSize: "3rem",
                                backgroundColor: colors.blueAccent[700],
                            }}
                        >
                            {formData.fullName.charAt(0)}
                        </Avatar>
                        <IconButton
                            sx={{
                                position: "absolute",
                                bottom: -5,
                                right: -5,
                                backgroundColor: colors.blueAccent[400],
                                color: colors.gray[900],
                                "&:hover": { backgroundColor: colors.blueAccent[300] },
                            }}
                            onClick={() => setOpenImageDialog(true)}
                        >
                            <PhotoCameraIcon />
                        </IconButton>
                    </Box>
                </Box>
            </ProfileSection>

            {/* Basic Information */}
            <ProfileSection title="Basic Information">
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            name="fullName"
                            value={isEditing ? editData.fullName : formData.fullName}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}
                            InputProps={{
                                sx: {
                                    color: colors.gray[100],
                                    "& .MuiInput-underline:before": {
                                        borderBottomColor: colors.primary[500],
                                    },
                                },
                            }}
                            InputLabelProps={{
                                sx: { color: colors.gray[300] },
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Doctor ID"
                            name="doctorId"
                            value={formData.doctorId}
                            disabled
                            variant="standard"
                            InputProps={{
                                sx: {
                                    color: colors.gray[100],
                                    "& .MuiInput-underline:before": {
                                        borderBottomColor: colors.primary[500],
                                    },
                                },
                            }}
                            InputLabelProps={{
                                sx: { color: colors.gray[300] },
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={isEditing ? editData.email : formData.email}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}
                            InputProps={{
                                sx: {
                                    color: colors.gray[100],
                                    "& .MuiInput-underline:before": {
                                        borderBottomColor: colors.primary[500],
                                    },
                                },
                            }}
                            InputLabelProps={{
                                sx: { color: colors.gray[300] },
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Contact Number"
                            name="contactNumber"
                            value={isEditing ? editData.contactNumber : formData.contactNumber}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}
                            InputProps={{
                                sx: {
                                    color: colors.gray[100],
                                    "& .MuiInput-underline:before": {
                                        borderBottomColor: colors.primary[500],
                                    },
                                },
                            }}
                            InputLabelProps={{
                                sx: { color: colors.gray[300] },
                            }}
                        />
                    </Grid>
                </Grid>
            </ProfileSection>

            {/* Professional Information */}
            <ProfileSection title="Professional Information">
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Specialization"
                            name="specialization"
                            value={isEditing ? editData.specialization : formData.specialization}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}
                            InputProps={{
                                sx: {
                                    color: colors.gray[100],
                                    "& .MuiInput-underline:before": {
                                        borderBottomColor: colors.primary[500],
                                    },
                                },
                            }}
                            InputLabelProps={{
                                sx: { color: colors.gray[300] },
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Department"
                            name="department"
                            value={isEditing ? editData.department : formData.department}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}
                            InputProps={{
                                sx: {
                                    color: colors.gray[100],
                                    "& .MuiInput-underline:before": {
                                        borderBottomColor: colors.primary[500],
                                    },
                                },
                            }}
                            InputLabelProps={{
                                sx: { color: colors.gray[300] },
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Qualification"
                            name="qualification"
                            value={isEditing ? editData.qualification : formData.qualification}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}
                            InputProps={{
                                sx: {
                                    color: colors.gray[100],
                                    "& .MuiInput-underline:before": {
                                        borderBottomColor: colors.primary[500],
                                    },
                                },
                            }}
                            InputLabelProps={{
                                sx: { color: colors.gray[300] },
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Experience"
                            name="experience"
                            value={isEditing ? editData.experience : formData.experience}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}
                            InputProps={{
                                sx: {
                                    color: colors.gray[100],
                                    "& .MuiInput-underline:before": {
                                        borderBottomColor: colors.primary[500],
                                    },
                                },
                            }}
                            InputLabelProps={{
                                sx: { color: colors.gray[300] },
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="License Number"
                            name="licenseNumber"
                            value={isEditing ? editData.licenseNumber : formData.licenseNumber}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}
                            InputProps={{
                                sx: {
                                    color: colors.gray[100],
                                    "& .MuiInput-underline:before": {
                                        borderBottomColor: colors.primary[500],
                                    },
                                },
                            }}
                            InputLabelProps={{
                                sx: { color: colors.gray[300] },
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Hospital"
                            name="hospital"
                            value={isEditing ? editData.hospital : formData.hospital}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}
                            InputProps={{
                                sx: {
                                    color: colors.gray[100],
                                    "& .MuiInput-underline:before": {
                                        borderBottomColor: colors.primary[500],
                                    },
                                },
                            }}
                            InputLabelProps={{
                                sx: { color: colors.gray[300] },
                            }}
                        />
                    </Grid>
                </Grid>
            </ProfileSection>

            {/* Bio Section */}
            <ProfileSection title="Professional Bio">
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Bio"
                    name="bio"
                    value={isEditing ? editData.bio : formData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "standard"}
                    InputProps={{
                        sx: {
                            color: colors.gray[100],
                            "& .MuiInput-underline:before": {
                                borderBottomColor: colors.primary[500],
                            },
                        },
                    }}
                    InputLabelProps={{
                        sx: { color: colors.gray[300] },
                    }}
                />
            </ProfileSection>

            {/* Save Button */}
            {isEditing && (
                <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={handleCancel}
                        sx={{ color: colors.redAccent[400], borderColor: colors.redAccent[400] }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        sx={{ backgroundColor: colors.greenAccent[400] }}
                    >
                        Save Changes
                    </Button>
                </Box>
            )}

            {/* Image Upload Dialog */}
            <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Upload Profile Picture</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id="profile-image-input"
                        type="file"
                        onChange={handleImageChange}
                    />
                    <label htmlFor="profile-image-input">
                        <Button
                            variant="contained"
                            component="span"
                            fullWidth
                            startIcon={<PhotoCameraIcon />}
                        >
                            Choose Image
                        </Button>
                    </label>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenImageDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DoctorProfile;
