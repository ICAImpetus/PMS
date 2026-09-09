import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    Paper,
    TextField,
    Button,
    Grid,
    Typography,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Stack,
    Divider,
} from "@mui/material";
import {
    PhotoCamera as PhotoCameraIcon,
    ArrowBack as ArrowBackIcon,
    NotificationsNone as NotificationsIcon,
    LocalHospital as HospitalIcon,
    PermIdentity as PAIcon,
    Description as BioIcon,
    Phone as PhoneIcon,
    WhatsApp as WhatsAppIcon,
    MedicalServices as ConsultationIcon,
} from "@mui/icons-material";
import { UserContextHook } from "../../../contexts/UserContexts";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { toTitleCase } from "../../../utils/normalizeUserType";

const DoctorProfile = () => {
    const { currentUser } = UserContextHook();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState(
        currentUser?.profilePicture || "https://via.placeholder.com/200?text=Dr.+Soni"
    );
    const [openImageDialog, setOpenImageDialog] = useState(false);

    const mapDoctorToForm = (user) => {
        return {
            name: user?.name || "N.D Soni",
            username: user?.username || "ND@ica123",

            opdNo: user?.refId?.opdNo || "2546585",
            contactNumber: user?.refId?.contactNumber || "3545341534",
            whatsappNumber: user?.refId?.whatsappNumber || "3545341534",

            designation: user?.refId?.designation || "Senior Consultant",
            specialization: user?.refId?.specialization || "Surgeon",
            department: user?.refId?.department?.name || "Cardiology",
            subDepartment: user?.refId?.subDepartment || "",

            experience: user?.refId?.experience || 25,
            qualification: (user?.refId?.degrees || ["MD", "MBBS"]).join(", "),
            customDegrees: (user?.refId?.customDegrees || []).join(", "),

            licenseNumber: user?.refId?.licenseNumber || "#MED-29481-22",

            hospital: user?.hospitals?.[0]?.name || "Mahatma Gandhi College & Hospital",
            floor: user?.refId?.floor || "1st Floor",
            extensionNumber: user?.refId?.extensionNumber || "#402",

            consultationCharges: user?.refId?.consultationCharges || 1500,
            averagePatientTime: user?.refId?.averagePatientTime || "15 min",
            maxPatientsHandled: user?.refId?.maxPatientsHandled || 0,

            teleConsultation: user?.refId?.teleConsultation || false,

            paName: user?.refId?.paName || "Amit Sharma",
            paContactNumber: user?.refId?.paContactNumber || "3545341534",

            bio:
                user?.refId?.bio ||
                "Dr. N.D Soni is a distinguished Senior Consultant Surgeon with over 25 years of specialized experience in Cardiovascular procedures. His career is marked by a profound dedication to patient care and academic excellence at Mahatma Gandhi College & Hospital. He specializes in minimally invasive cardiac surgeries and complex aortic interventions.",
            additionalInfo:
                user?.refId?.additionalInfo ||
                "Speaks: English, Hindi, Punjabi. Availability: Mon-Fri (10 AM - 5 PM)",
        };
    };

    const [formData, setFormData] = useState(mapDoctorToForm(currentUser));
    const [editData, setEditData] = useState(formData);

    useEffect(() => {
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

    return (
        <Box sx={{ backgroundColor: "#f8fafc", minHeight: "100vh", pb: 6, pt: 3 }}>
            <Container maxWidth="xl">
                {/* Header Navigation Bar */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            px: 2.5,
                            py: 1,
                            borderRadius: "100px",
                            border: "1px solid #e2e8f0",
                            backgroundColor: "#ffffff",
                        }}
                    >
                        <Typography variant="body2" fontWeight={700} color="#1e293b" fontSize="0.85rem">
                            {formData.hospital}
                        </Typography>
                    </Paper>

                    <Box display="flex" alignItems="center" gap={2}>
                        <IconButton sx={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#64748b" }}>
                            <NotificationsIcon sx={{ fontSize: "1.2rem" }} />
                        </IconButton>
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <Box textAlign="right">
                                <Typography variant="body2" fontWeight={800} color="#0f172a" fontSize="0.85rem" lineHeight={1.2}>
                                    Dr. {formData.name}
                                </Typography>
                                <Typography variant="caption" fontWeight={700} color="#94a3b8" fontSize="0.65rem" sx={{ textTransform: "uppercase" }}>
                                    {formData.specialization || "SURGEON"}
                                </Typography>
                            </Box>
                            <Avatar src={profileImage} sx={{ width: 38, height: 38 }} />
                        </Box>
                    </Box>
                </Box>

                {/* Page Title */}
                <Box mb={4}>
                    <Typography variant="h3" fontWeight={800} color="#0f172a" letterSpacing="-0.5px" mb={0.5}>
                        My Profile
                    </Typography>
                    <Typography variant="body1" color="#64748b" fontSize="0.95rem">
                        Complete professional information and credentials.
                    </Typography>
                </Box>

                {/* Main Content Layout */}
                <Grid container spacing={3}>
                    {/* Left Column: Avatar & Contact Details */}
                    <Grid item xs={12} md={4}>
                        <Stack spacing={3}>
                            {/* Profile Header Card */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    borderRadius: "24px",
                                    backgroundColor: "#ffffff",
                                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
                                    textAlign: "center",
                                    position: "relative",
                                }}
                            >
                                <Box display="flex" justifyContent="center" mb={3}>
                                    <Box position="relative">
                                        <Avatar
                                            src={profileImage}
                                            alt={formData.name}
                                            sx={{
                                                width: 130,
                                                height: 130,
                                                border: "4px solid #ffffff",
                                                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                                            }}
                                        />
                                        <IconButton
                                            sx={{
                                                position: "absolute",
                                                bottom: 4,
                                                right: 4,
                                                backgroundColor: "#2563eb",
                                                color: "#ffffff",
                                                p: 0.8,
                                                "&:hover": { backgroundColor: "#1d4ed8" },
                                            }}
                                            onClick={() => setOpenImageDialog(true)}
                                        >
                                            <PhotoCameraIcon sx={{ fontSize: "1rem" }} />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Typography variant="h5" fontWeight={800} color="#0f172a" mb={1}>
                                    Dr. {toTitleCase(formData.name)}
                                </Typography>

                                <Chip
                                    label={`${formData.designation.toUpperCase()} ${formData.specialization.toUpperCase()}`}
                                    size="small"
                                    sx={{
                                        backgroundColor: "#eff6ff",
                                        color: "#2563eb",
                                        fontWeight: 800,
                                        fontSize: "0.65rem",
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: "6px",
                                        mb: 4,
                                    }}
                                />

                                <Grid container spacing={2} sx={{ pt: 2, borderTop: "1px solid #f1f5f9" }}>
                                    <Grid item xs={4}>
                                        <Typography variant="h6" fontWeight={800} color="#0f172a">
                                            {formData.experience}+
                                        </Typography>
                                        <Typography variant="caption" fontWeight={700} color="#94a3b8" fontSize="0.65rem" sx={{ textTransform: "uppercase" }}>
                                            YEARS EXP
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="h6" fontWeight={800} color="#0f172a">
                                            4.9
                                        </Typography>
                                        <Typography variant="caption" fontWeight={700} color="#94a3b8" fontSize="0.65rem" sx={{ textTransform: "uppercase" }}>
                                            RATING
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="h6" fontWeight={800} color="#0f172a">
                                            12k+
                                        </Typography>
                                        <Typography variant="caption" fontWeight={700} color="#94a3b8" fontSize="0.65rem" sx={{ textTransform: "uppercase" }}>
                                            PATIENTS
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Contact Details Card */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: "24px",
                                    backgroundColor: "#ffffff",
                                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                                    <Box sx={{ p: 1, borderRadius: "10px", backgroundColor: "#f8fafc", color: "#64748b" }}>
                                        <PhoneIcon sx={{ fontSize: "1.1rem" }} />
                                    </Box>
                                    <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing="0.5px">
                                        CONTACT DETAILS
                                    </Typography>
                                </Box>

                                <Stack spacing={2.5}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" color="#64748b" fontSize="0.85rem">
                                            Mobile Number
                                        </Typography>
                                        <Typography variant="body2" fontWeight={700} color="#0f172a">
                                            {formData.contactNumber}
                                        </Typography>
                                    </Box>

                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" color="#64748b" fontSize="0.85rem">
                                            Whatsapp
                                        </Typography>
                                        <Box display="flex" alignItems="center" gap={0.8}>
                                            <WhatsAppIcon sx={{ fontSize: "0.9rem", color: "#2563eb" }} />
                                            <Typography variant="body2" fontWeight={700} color="#2563eb">
                                                {formData.whatsappNumber}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" color="#64748b" fontSize="0.85rem">
                                            Username
                                        </Typography>
                                        <Typography variant="body2" fontWeight={700} color="#0f172a">
                                            {formData.username}
                                        </Typography>
                                    </Box>

                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" color="#64748b" fontSize="0.85rem">
                                            OPD No.
                                        </Typography>
                                        <Typography variant="body2" fontWeight={700} color="#0f172a">
                                            {formData.opdNo}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Stack>
                    </Grid>

                    {/* Right Column: Credentials, Hospital, PA & Bio */}
                    <Grid item xs={12} md={8}>
                        <Stack spacing={3}>
                            {/* Professional Credentials Card */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3.5,
                                    borderRadius: "24px",
                                    backgroundColor: "#ffffff",
                                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
                                }}
                            >
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                        <Box sx={{ width: 4, height: 22, backgroundColor: "#2563eb", borderRadius: "2px" }} />
                                        <Typography variant="h6" fontWeight={800} color="#0f172a" fontSize="1.1rem">
                                            Professional Credentials
                                        </Typography>
                                    </Box>

                                    <Chip
                                        label="VERIFIED PRACTITIONER"
                                        size="small"
                                        sx={{
                                            backgroundColor: "#f0fdf4",
                                            color: "#16a34a",
                                            fontWeight: 800,
                                            fontSize: "0.65rem",
                                            borderRadius: "6px",
                                        }}
                                    />
                                </Box>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing="0.5px" display="block" mb={0.5}>
                                            QUALIFICATION
                                        </Typography>
                                        <Typography variant="body1" fontWeight={700} color="#0f172a">
                                            {formData.qualification}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing="0.5px" display="block" mb={0.5}>
                                            DESIGNATION
                                        </Typography>
                                        <Typography variant="body1" fontWeight={700} color="#0f172a">
                                            {formData.designation}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing="0.5px" display="block" mb={0.5}>
                                            DEPARTMENT
                                        </Typography>
                                        <Typography variant="body1" fontWeight={700} color="#0f172a">
                                            {formData.department}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing="0.5px" display="block" mb={0.5}>
                                            TOTAL EXPERIENCE
                                        </Typography>
                                        <Typography variant="body1" fontWeight={700} color="#0f172a">
                                            {formData.experience} Years
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing="0.5px" display="block" mb={0.5}>
                                            SPECIALIZATION
                                        </Typography>
                                        <Typography variant="body1" fontWeight={700} color="#0f172a">
                                            {formData.specialization}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing="0.5px" display="block" mb={0.5}>
                                            LICENSE NUMBER
                                        </Typography>
                                        <Typography variant="body1" fontWeight={800} color="#2563eb">
                                            {formData.licenseNumber}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Hospital & Consultation Info Row */}
                            <Grid container spacing={3}>
                                {/* Hospital Details Card */}
                                <Grid item xs={12} sm={6}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: "24px",
                                            backgroundColor: "#ffffff",
                                            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
                                            height: "100%",
                                        }}
                                    >
                                        <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                                            <Box sx={{ p: 1, borderRadius: "10px", backgroundColor: "#eff6ff", color: "#2563eb" }}>
                                                <HospitalIcon sx={{ fontSize: "1.1rem" }} />
                                            </Box>
                                            <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing="0.5px">
                                                HOSPITAL DETAILS
                                            </Typography>
                                        </Box>

                                        <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing="0.5px" display="block" mb={0.5}>
                                            AFFILIATED HOSPITAL
                                        </Typography>
                                        <Typography variant="body2" fontWeight={700} color="#0f172a" mb={2}>
                                            {formData.hospital}
                                        </Typography>

                                        <Box display="flex" gap={4}>
                                            <Box>
                                                <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing="0.5px" display="block" mb={0.5}>
                                                    FLOOR
                                                </Typography>
                                                <Typography variant="body2" fontWeight={700} color="#0f172a">
                                                    {formData.floor}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing="0.5px" display="block" mb={0.5}>
                                                    EXTENSION
                                                </Typography>
                                                <Typography variant="body2" fontWeight={700} color="#0f172a">
                                                    {formData.extensionNumber}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>

                                {/* Consultation Info Card */}
                                <Grid item xs={12} sm={6}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: "24px",
                                            backgroundColor: "#ffffff",
                                            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
                                            height: "100%",
                                        }}
                                    >
                                        <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                                            <Box sx={{ p: 1, borderRadius: "10px", backgroundColor: "#eff6ff", color: "#2563eb" }}>
                                                <ConsultationIcon sx={{ fontSize: "1.1rem" }} />
                                            </Box>
                                            <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing="0.5px">
                                                CONSULTATION INFO
                                            </Typography>
                                        </Box>

                                        <Grid container spacing={2} mb={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing="0.5px" display="block" mb={0.5}>
                                                    CHARGES (INR)
                                                </Typography>
                                                <Typography variant="h5" fontWeight={800} color="#2563eb">
                                                    ₹ {formData.consultationCharges}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing="0.5px" display="block" mb={0.5}>
                                                    AVG TIME
                                                </Typography>
                                                <Typography variant="h6" fontWeight={800} color="#0f172a">
                                                    {formData.averagePatientTime}
                                                </Typography>
                                            </Grid>
                                        </Grid>

                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 1.5,
                                                borderRadius: "12px",
                                                backgroundColor: "#fff5f5",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Typography variant="caption" fontWeight={800} color="#64748b" letterSpacing="0.5px">
                                                TELE-CONSULTATION
                                            </Typography>
                                            <Typography variant="caption" fontWeight={800} color="#dc2626">
                                                {formData.teleConsultation ? "AVAILABLE" : "UNAVAILABLE"}
                                            </Typography>
                                        </Paper>
                                    </Paper>
                                </Grid>
                            </Grid>

                            {/* PA Info & Bio Row */}
                            <Grid container spacing={3}>
                                {/* PA Information Card */}
                                <Grid item xs={12} sm={5}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: "24px",
                                            backgroundColor: "#ffffff",
                                            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
                                            height: "100%",
                                        }}
                                    >
                                        <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                                            <Box sx={{ p: 1, borderRadius: "10px", backgroundColor: "#f8fafc", color: "#64748b" }}>
                                                <PAIcon sx={{ fontSize: "1.1rem" }} />
                                            </Box>
                                            <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing="0.5px">
                                                PA INFORMATION
                                            </Typography>
                                        </Box>

                                        <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing="0.5px" display="block" mb={0.5}>
                                            ASSISTANT NAME
                                        </Typography>
                                        <Typography variant="body2" fontWeight={700} color="#0f172a" mb={2}>
                                            {formData.paName}
                                        </Typography>

                                        <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing="0.5px" display="block" mb={0.5}>
                                            PA CONTACT
                                        </Typography>
                                        <Typography variant="body2" fontWeight={700} color="#2563eb">
                                            {formData.paContactNumber}
                                        </Typography>
                                    </Paper>
                                </Grid>

                                {/* Professional Bio Card */}
                                <Grid item xs={12} sm={7}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: "24px",
                                            backgroundColor: "#ffffff",
                                            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
                                            height: "100%",
                                        }}
                                    >
                                        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                                            <Box sx={{ p: 1, borderRadius: "10px", backgroundColor: "#eff6ff", color: "#2563eb" }}>
                                                <BioIcon sx={{ fontSize: "1.1rem" }} />
                                            </Box>
                                            <Typography variant="caption" fontWeight={800} color="#94a3b8" letterSpacing="0.5px">
                                                PROFESSIONAL BIO
                                            </Typography>
                                        </Box>

                                        <Typography variant="body2" color="#475569" lineHeight={1.6} mb={2}>
                                            {formData.bio}
                                        </Typography>

                                        {formData.additionalInfo && (
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: "12px",
                                                    backgroundColor: "#f8fafc",
                                                }}
                                            >
                                                <Typography variant="caption" fontWeight={800} color="#94a3b8" display="block" mb={0.5} letterSpacing="0.5px">
                                                    ADDITIONAL INFO
                                                </Typography>
                                                <Typography variant="caption" color="#64748b" fontWeight={600}>
                                                    {formData.additionalInfo}
                                                </Typography>
                                            </Paper>
                                        )}
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Stack>
                    </Grid>
                </Grid>

                {/* Footer Section */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={6} pt={3} borderTop="1px solid #e2e8f0">
                    <Typography variant="caption" fontWeight={700} color="#94a3b8" letterSpacing="0.5px">
                        © 2026 INFINIS CLINICAL PRECISION
                    </Typography>
                    <Box display="flex" gap={3}>
                        <Typography variant="caption" fontWeight={700} color="#94a3b8" sx={{ cursor: "pointer", letterSpacing: "0.5px" }}>
                            PRIVACY POLICY
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color="#94a3b8" sx={{ cursor: "pointer", letterSpacing: "0.5px" }}>
                            SUPPORT
                        </Typography>
                    </Box>
                </Box>
            </Container>

            {/* Image Upload Dialog */}
            <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Upload Profile Picture</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <input accept="image/*" style={{ display: "none" }} id="profile-image-input" type="file" onChange={handleImageChange} />
                    <label htmlFor="profile-image-input">
                        <Button variant="contained" component="span" fullWidth startIcon={<PhotoCameraIcon />}>
                            Choose Image
                        </Button>
                    </label>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenImageDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DoctorProfile;