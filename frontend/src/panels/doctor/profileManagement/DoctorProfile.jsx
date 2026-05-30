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
    ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { tokens } from "../../../theme";
import { UserContextHook } from "../../../contexts/UserContexts";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const DoctorProfile = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { currentUser } = UserContextHook();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState(currentUser?.profilePicture || "https://via.placeholder.com/200?text=Dr.+Rajesh");
    const [openImageDialog, setOpenImageDialog] = useState(false);

    // Dummy doctor data with complete model fields
    const dummyDoctor = {
        _id: "6a17f226883d8a85d30aee8a",
        hospitals: [
            {
                hospitalId: {
                    _id: "69d4c091a6740216ffc532ad",
                    corporateAddress:
                        "78-79, Dhuleshwar Garden, Sardar Patel Marg",
                },
                name: "SR Kalla Memorial Hospital",
                _id: "6a17f226883d8a85d30aee8b",
            },
        ],
        username: "shobhit@123",
        name: "shobhit ica",
        type: "doctor",
        isAdmin: false,
        dailyAccumulatedTime: 0,
        isLoggedIn: false,
        lastSessionDuration: 0,
        loginCount: 0,
        isDeleted: false,

        refId: {
            _id: "6a17f226883d8a85d30aee74",
            branch: "69d4c091a6740216ffc532b1",

            department: {
                _id: "69d8c06f813b31523870be42",
                name: "Cardio",
                doctors: [
                    "69d8c0be813b31523870be5b",
                    "6a17f226883d8a85d30aee74",
                ],
                branch: "69d4c091a6740216ffc532b1",
                isDeleted: false,
                createdAt: "2026-04-10T09:18:39.760Z",
                updatedAt: "2026-05-28T07:43:34.291Z",
                __v: 0,
            },

            name: "shobhit ica",
            username: "shobhit@123",
            profilePicture: null,
            contactNumber: "7894564654",
            experience: 11,
            totalBookedPatients: 0,

            degrees: ["DO"],
            customDegrees: [],

            subDepartment: "",

            timings: {
                morning: {
                    start: "09:01 AM",
                    end: "02:00 PM",
                },

                evening: {
                    start: "",
                    end: "",
                },

                custom: {
                    start: "",
                    end: "",
                },
            },

            title: "Dr",
            designation: "Seniorconsultant",
        },

        canDelete: false,
        branches: [],

        createdAt: "2026-05-28T07:43:34.333Z",
        updatedAt: "2026-05-28T07:56:50.311Z",
    };

    const [formData, setFormData] = useState(dummyDoctor);
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
                titleTypographyProps={{ color: colors.grey[100] }}
                sx={{ pb: 1 }}
            />
            <Divider sx={{ borderColor: colors.primary[500] }} />
            <CardContent>{children}</CardContent>
        </Card>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={2}>
                    <IconButton onClick={() => navigate(-1)} sx={{ color: colors.grey[100] }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h3" color={colors.grey[100]} fontWeight="bold" mb={1}>
                            My Profile
                        </Typography>
                        <Typography color={colors.grey[300]} variant="body1">
                            Complete professional information and credentials
                        </Typography>
                    </Box>
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
                            alt={formData.name}
                            sx={{
                                width: 150,
                                height: 150,
                                fontSize: "3rem",
                                backgroundColor: colors.blueAccent[700],
                            }}
                        >
                            {formData.name.charAt(0)}
                        </Avatar>
                        <IconButton
                            sx={{
                                position: "absolute",
                                bottom: -5,
                                right: -5,
                                backgroundColor: colors.blueAccent[400],
                                color: colors.grey[900],
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
                            label="Title"
                            name="title"
                            value={isEditing ? editData.title : formData.title}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}
                        // InputProps={{
                        //     sx: {
                        //         color: colors.grey[100],
                        //         "& .MuiInput-underline:before": {
                        //             borderBottomColor: colors.primary[500],
                        //         },
                        //     },
                        // }}
                        // InputLabelProps={{
                        //     sx: { color: colors.grey[300] },
                        // }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            name="name"
                            value={isEditing ? editData.name : formData.name}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}
                            InputProps={{
                            }}
                            InputLabelProps={{
                                // sx: { color: colors.grey[300] },
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Doctor ID"
                            name="_id"
                            value={formData._id}
                            disabled
                            variant="standard"
                        // InputProps={{
                        //     sx: {
                        //         color: colors.grey[100],
                        //         "& .MuiInput-underline:before": {
                        //             borderBottomColor: colors.primary[500],
                        //         },
                        //     },
                        // }}
                        // InputLabelProps={{
                        //     sx: { color: colors.grey[300] },
                        // }}
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
                        // InputProps={{
                        //     sx: {
                        //         color: colors.grey[100],
                        //         "& .MuiInput-underline:before": {
                        //             borderBottomColor: colors.primary[500],
                        //         },
                        //     },
                        // }}
                        // InputLabelProps={{
                        //     sx: { color: colors.grey[300] },
                        // }}
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
                        // InputProps={{
                        //     sx: {
                        //         color: colors.grey[100],
                        //         "& .MuiInput-underline:before": {
                        //             borderBottomColor: colors.primary[500],
                        //         },
                        //     },
                        // }}
                        // InputLabelProps={{
                        //     sx: { color: colors.grey[300] },
                        // }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="WhatsApp Number"
                            name="whatsappNumber"
                            value={isEditing ? editData.whatsappNumber : formData.whatsappNumber}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}
                        // InputProps={{
                        //     sx: {
                        //         color: colors.grey[100],
                        //         "& .MuiInput-underline:before": {
                        //             borderBottomColor: colors.primary[500],
                        //         },
                        //     },
                        // }}
                        // InputLabelProps={{
                        //     sx: { color: colors.grey[300] },
                        // }}
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
                            label="Designation"
                            name="designation"
                            value={isEditing ? editData.designation : formData.designation}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}
                        // InputProps={{
                        //     sx: {
                        //         color: colors.grey[100],
                        //         "& .MuiInput-underline:before": {
                        //             borderBottomColor: colors.primary[500],
                        //         },
                        //     },
                        // }}
                        // InputLabelProps={{
                        //     sx: { color: colors.grey[300] },
                        // }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Specialization"
                            name="specialization"
                            value={isEditing ? editData.specialization : formData.specialization}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}
                        // InputProps={{
                        //     sx: {
                        //         color: colors.grey[100],
                        //         "& .MuiInput-underline:before": {
                        //             borderBottomColor: colors.primary[500],
                        //         },
                        //     },
                        // }}
                        // InputLabelProps={{
                        //     sx: { color: colors.grey[300] },
                        // }}
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
                        // InputProps={{
                        //     sx: {
                        //         color: colors.grey[100],
                        //         "& .MuiInput-underline:before": {
                        //             borderBottomColor: colors.primary[500],
                        //         },
                        //     },
                        // }}
                        // InputLabelProps={{
                        //     sx: { color: colors.grey[300] },
                        // }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Sub-Department"
                            name="subDepartment"
                            value={isEditing ? editData.subDepartment : formData.subDepartment}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}
                        // InputProps={{
                        //     sx: {
                        //         color: colors.grey[100],
                        //         "& .MuiInput-underline:before": {
                        //             borderBottomColor: colors.primary[500],
                        //         },
                        //     },
                        // }}
                        // InputLabelProps={{
                        //     sx: { color: colors.grey[300] },
                        // }}
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

                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Custom Degrees"
                            name="customDegrees"
                            value={isEditing ? editData.customDegrees : formData.customDegrees}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}

                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Experience (Years)"
                            name="experience"
                            type="number"
                            value={isEditing ? editData.experience : formData.experience}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}

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

                        />
                    </Grid>
                </Grid>
            </ProfileSection>

            {/* Hospital & Location Information */}
            <ProfileSection title="Hospital & Location Information">
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Hospital"
                            name="hospital"
                            value={isEditing ? editData.hospital : formData.hospital}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}

                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Floor"
                            name="floor"
                            value={isEditing ? editData.floor : formData.floor}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}

                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Extension Number"
                            name="extensionNumber"
                            value={isEditing ? editData.extensionNumber : formData.extensionNumber}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}

                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="OPD Number"
                            name="opdNo"
                            value={isEditing ? editData.opdNo : formData.opdNo}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}

                        />
                    </Grid>
                </Grid>
            </ProfileSection>

            {/* Consultation Information */}
            <ProfileSection title="Consultation Information">
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Consultation Charges"
                            name="consultationCharges"
                            type="number"
                            value={isEditing ? editData.consultationCharges : formData.consultationCharges}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}

                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Average Patient Time"
                            name="averagePatientTime"
                            value={isEditing ? editData.averagePatientTime : formData.averagePatientTime}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}

                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Max Patients Handled"
                            name="maxPatientsHandled"
                            type="number"
                            value={isEditing ? editData.maxPatientsHandled : formData.maxPatientsHandled}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}

                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Tele-Consultation Available"
                            name="teleConsultation"
                            value={isEditing ? editData.teleConsultation : formData.teleConsultation}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}

                        />
                    </Grid>
                </Grid>
            </ProfileSection>

            {/* Personal Assistant Information */}
            <ProfileSection title="Personal Assistant Information">
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="PA Name"
                            name="paName"
                            value={isEditing ? editData.paName : formData.paName}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}

                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="PA Contact Number"
                            name="paContactNumber"
                            value={isEditing ? editData.paContactNumber : formData.paContactNumber}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}

                        />
                    </Grid>
                </Grid>
            </ProfileSection>

            {/* Bio Section */}
            <ProfileSection title="Professional Bio & Additional Info">
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Professional Bio"
                            name="bio"
                            value={isEditing ? editData.bio : formData.bio}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}

                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Additional Information"
                            name="additionalInfo"
                            value={isEditing ? editData.additionalInfo : formData.additionalInfo}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}
                        // InputProps={{
                        //     sx: {
                        //         color: colors.grey[100],
                        //         "& .MuiInput-underline:before": {
                        //             borderBottomColor: colors.primary[500],
                        //         },
                        //     },
                        // }}
                        // InputLabelProps={{
                        //     sx: { color: colors.grey[300] },
                        // }}
                        />
                    </Grid>
                </Grid>
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
