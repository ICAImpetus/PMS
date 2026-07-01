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
import { toast } from "react-toastify";
import { toTitleCase } from "../../../utils/normalizeUserType";

const DoctorProfile = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { currentUser } = UserContextHook();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState(currentUser?.profilePicture || "https://via.placeholder.com/200?text=Dr.+Rajesh");
    const [openImageDialog, setOpenImageDialog] = useState(false);

    const mapDoctorToForm = (user) => {
        return {
            name: user?.name || "",
            username: user?.username || "",

            // doctor core
            opdNo: user?.refId?.opdNo || "",
            contactNumber: user?.refId?.contactNumber || "",
            whatsappNumber: user?.refId?.whatsappNumber || "",

            designation: user?.refId?.designation || "",
            specialization: user?.refId?.specialization || "",
            department: user?.refId?.department?.name || "",
            subDepartment: user?.refId?.subDepartment || "",

            experience: user?.refId?.experience || 0,
            qualification: (user?.refId?.degrees || []).join(", "),
            customDegrees: (user?.refId?.customDegrees || []).join(", "),

            licenseNumber: user?.refId?.licenseNumber || "",

            hospital: user?.hospitals?.[0]?.name || "",
            floor: user?.refId?.floor || "",
            extensionNumber: user?.refId?.extensionNumber || "",

            consultationCharges: user?.refId?.consultationCharges || 0,
            averagePatientTime: user?.refId?.averagePatientTime || "",
            maxPatientsHandled: user?.refId?.maxPatientsHandled || 0,

            teleConsultation: user?.refId?.teleConsultation || false,

            paName: user?.refId?.paName || "",
            paContactNumber: user?.refId?.paContactNumber || "",

            bio: user?.refId?.bio || "",
            additionalInfo: user?.refId?.additionalInfo || ""
        };
    };

    const [formData, setFormData] = useState(mapDoctorToForm(currentUser));
    const [editData, setEditData] = useState(formData);


    React.useEffect(() => {
        if (currentUser) {
            setFormData(mapDoctorToForm(currentUser));
            setEditData(mapDoctorToForm(currentUser));
        }
    }, [currentUser]);
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
                {/* <Button
                    variant={isEditing ? "outlined" : "contained"}
                    startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
                    onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
                    sx={{
                        color: isEditing ? colors.redAccent[400] : "inherit",
                        borderColor: isEditing ? colors.redAccent[400] : "inherit",
                    }}
                >
                    {isEditing ? "Cancel" : "Edit Profile"}
                </Button> */}
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

                    {/* Name */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            name="name"
                            value={isEditing ? toTitleCase(editData.name) : toTitleCase(formData.name)}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}
                        />
                    </Grid>

                    {/* Username */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Username"
                            name="username"
                            value={formData.username}
                            disabled
                            variant="standard"
                        />
                    </Grid>

                    {/* OPD */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="OPD No"
                            name="opdNo"
                            value={isEditing ? editData.opdNo : formData.opdNo}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}
                        />
                    </Grid>

                    {/* Contact */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Contact Number"
                            name="contactNumber"
                            value={isEditing ? editData.contactNumber : formData.contactNumber}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}
                        />
                    </Grid>

                    {/* WhatsApp */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="WhatsApp Number"
                            name="whatsappNumber"
                            value={isEditing ? editData.whatsappNumber : formData.whatsappNumber}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}
                        />
                    </Grid>

                    {/* CONSULTATION FEES (ADDED) */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Consultation Fees"
                            name="consultationCharges"
                            type="number"
                            value={isEditing ? editData.consultationCharges : formData.consultationCharges}
                            onChange={handleChange}
                            disabled={!isEditing}
                            variant={isEditing ? "outlined" : "standard"}
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
