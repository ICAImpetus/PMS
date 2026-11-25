import React, { useContext, useEffect, useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Grid,
    MenuItem,
    Button,
    InputAdornment,
    Divider,
    Stack,
    Autocomplete,
    CircularProgress,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import WcOutlinedIcon from "@mui/icons-material/WcOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { toast } from "react-toastify";
import HospitalContext from "../../contexts/HospitalContexts";
;


const rajasthanDistricts = [
    "Ajmer", "Alwar", "Anupgarh", "Balotra", "Banswara", "Baran", "Barmer",
    "Beawar", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh",
    "Churu", "Dausa", "Deeg", "Dholpur", "Didwana-Kuchaman", "Dudu",
    "Dungarpur", "Gangapur City", "Hanumangarh", "Jaipur", "Jaisalmer",
    "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kekri",
    "Khairthal-Tijara", "Kota", "Kotputli-Behror", "Nagaur", "Neem Ka Thana",
    "Pali", "Phalodi", "Pratapgarh", "Rajsamand", "Salumbar", "Sanchore",
    "Sawai Madhopur", "Shahpura", "Sikar", "Sirohi", "Sri Ganganagar",
    "Tonk", "Udaipur"
];




const INITIAL_STATE = {
    patientName: "",
    doctorId: "",
    patientGender: "",
    patientAddress: "",
    patientPhone: "",
};


export const CampFeedForm = () => {
    // Fixed: Array destructuring instead of object destructuring
    const [forms, setForms] = useState(INITIAL_STATE);
    const [errors, setErrors] = useState({});
    const [fdoctors, setFDoctors] = useState([])

    const {
        doctors,
        isDoctorsLoading,
        selectedHostpital,
        addCampData,
        isSavingCamp

    } = useContext(HospitalContext);
    useEffect(() => {
        const formatDoctorName = (rawName = "") => {
            // 1. Pehle se lage "DR.", "Dr", "dr." aur extra spaces ko hatayein
            const cleanName = rawName.replace(/^dr\.?\s*/i, "").trim();

            // 2. Har word ke pehle letter ko Capital aur baaki ko small (Title Case) karein
            const titleCaseName = cleanName
                .toLowerCase()
                .split(/\s+/)
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");

            // 3. Sabke aage uniform "Dr. " add karein
            return titleCaseName ? `Dr. ${titleCaseName}` : "";
        };

        if (doctors?.length) {
            const updatedDoctors = doctors.map((doc) => ({
                _id: doc?._id,
                name: `${formatDoctorName(doc?.name)} (${doc?.department?.name || "N/A"})`,
            }));
            setFDoctors(updatedDoctors);
        } else {
            setFDoctors([]);
        }
    }, [doctors]);

    const validateForm = () => {
        let tempErrors = {};

        // 1. Patient Name Validation (Separate 'if' block)
        const name = forms.patientName?.trim() || "";
        if (!name) {
            tempErrors.patientName = "Patient Name is required";
        } else if (name.length < 3) {
            tempErrors.patientName = "Patient Name is too short (min length is 3 characters)";
        } else if (name.length > 100) {
            tempErrors.patientName = "Patient Name is too long (max length is 100 characters)";
        }

        // 2. Patient Phone Validation (Naya 'if' block)
        const phone = forms.patientPhone?.trim() || "";
        if (!phone) {
            tempErrors.patientPhone = "Mobile no is required";
        } else if (!/^\d+$/.test(phone)) {
            tempErrors.patientPhone = "Only numbers are allowed in Mobile no";
        } else if (phone.length !== 10 && phone.length !== 12) {
            tempErrors.patientPhone = "Mobile no must be 10 or 12 digits";
        }

        // 3. City Validation (Naya 'if' block)
        const city = forms.patientAddress?.trim() || "";
        console.log("");

        if (!city) {
            tempErrors.patientAddress = "City / District is required";
        } else if (city.length < 3) {
            tempErrors.patientAddress = "Enter a valid city name (min length is 3 characters)";
        }

        setErrors(tempErrors);
        console.log("tempErrors", tempErrors)
        return Object.keys(tempErrors).length === 0;
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log("patientAddress", name);

        setForms((prev) => ({
            ...prev,
            [name]: value,
        }));




        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: ""
            }))
        }
    };
    console.log("forsm", forms);

    const handleReset = () => {
        setForms(INITIAL_STATE);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            addCampData(forms, {
                onSuccess: () => {
                    setForms(INITIAL_STATE);
                    toast.success("Camp feed data saved successfully!");
                },
                onError: (error) => {
                    const errMsg = error?.response?.data?.message || "Failed to save camp data";
                    toast.error(errMsg); // Ya alert(errMsg) / setApiError(errMsg)
                },
            });
        }
    };

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            backgroundColor: "#F8FAFC",
            "& fieldset": { borderColor: "#EAECF0" },
            "&:hover fieldset": { borderColor: "#155EEF" },
            "&.Mui-focused": {
                backgroundColor: "#FFFFFF",
                "& fieldset": { borderColor: "#155EEF" },
            },
        },
    };



    return (
        <Box
            sx={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                p: { xs: 2.5, sm: 3.5 },
                mb: 3,
                border: "1px solid #EAECF0",
                boxShadow: "0px 2px 10px rgba(16, 24, 40, 0.04)",
            }}
        >
            {/* Header matching Infinis Card Style */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 4,
                            height: 22,
                            borderRadius: 2,
                            backgroundColor: "#155EEF",
                        }}
                    />
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, color: "#101828", fontSize: "1.1rem", lineHeight: 1.2 }}
                        >
                            Patient Registration Form
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#667085" }}>
                            Enter patient contact details, gender, and assigned doctor
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Divider sx={{ my: 2.5, borderColor: "#EAECF0" }} />


            <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2.5}>
                    {/* Patient Phone */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Patient Phone"
                            error={Boolean(errors.patientPhone)}
                            helperText={errors.patientPhone}
                            name="patientPhone"
                            placeholder="e.g. 9876543210"
                            value={forms.patientPhone}
                            onChange={handleChange}
                            fullWidth
                            required
                            inputProps={{ maxLength: 10 }}
                            sx={inputSx}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PhoneOutlinedIcon fontSize="small" sx={{ color: "#667085" }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    {/* Patient Name */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Patient Full Name"
                            name="patientName"
                            placeholder="Enter patient name"
                            value={forms.patientName}
                            error={Boolean(errors.patientName)}
                            helperText={errors.patientName}
                            onChange={handleChange}
                            fullWidth
                            required
                            sx={inputSx}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonOutlineIcon fontSize="small" sx={{ color: "#667085" }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    {/* Gender Dropdown */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            value={forms.patientGender}
                            error={Boolean(errors.patientGender)}
                            helperText={errors.patientGender}
                            label="Patient Gender"
                            name="patientGender"

                            onChange={handleChange}
                            fullWidth
                            required
                            sx={inputSx}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <WcOutlinedIcon fontSize="small" sx={{ color: "#667085" }} />
                                    </InputAdornment>
                                ),
                            }}
                        >
                            <MenuItem value="" disabled>
                                Select Gender
                            </MenuItem>
                            <MenuItem value="male">Male</MenuItem>
                            <MenuItem value="female">Female</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </TextField>
                    </Grid>

                    {/* Doctor Dropdown (or change back to text input if you type ID manually) */}
                    {/* <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            error={Boolean(errors.doctorId)}
                            helperText={errors.doctorId}
                            label="Assigned Doctor"
                            name="doctorId"
                            value={forms.doctorId}
                            onChange={handleChange}
                            fullWidth
                            required
                            sx={inputSx}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <MedicalServicesOutlinedIcon fontSize="small" sx={{ color: "#667085" }} />
                                    </InputAdornment>
                                ),
                            }}
                        >
                            <MenuItem value="" disabled>
                                Select Doctor
                            </MenuItem>
                            {DOCTORS_LIST.map((doc) => (
                                <MenuItem key={doc.id} value={doc.id}>
                                    {doc.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid> */}

                    <Grid item xs={12} sm={6}>
                        <Autocomplete
                            options={fdoctors?.length ? fdoctors : []}
                            getOptionLabel={(option) => option?.name || ""}
                            isOptionEqualToValue={(option, value) => option?._id === value?._id}
                            value={fdoctors?.find((doc) => doc._id === forms.doctorId) || null}
                            onChange={(event, newValue) => {
                                setForms((prev) => ({
                                    ...prev,
                                    doctorId: newValue ? newValue._id : null
                                }));
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    error={Boolean(errors?.doctorId)}
                                    helperText={errors?.doctorId}
                                    label="Assigned Doctor"
                                    placeholder="Search Doctor By Name"
                                    sx={inputSx}
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <>
                                                <InputAdornment position="start">
                                                    <MedicalServicesOutlinedIcon fontSize="small" sx={{ color: "#667085" }} />
                                                </InputAdornment>
                                                {params.InputProps.startAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                    </Grid>
                    {/* Patient Address */}
                    <Grid item xs={12} sm={6}>
                        <Autocomplete
                            freeSolo
                            error={Boolean(errors.patientAddress)}
                            helperText={errors.patientAddress}
                            options={rajasthanDistricts}
                            value={forms.patientAddress}
                            onChange={(event, newValue) => {
                                console.log("newValue", newValue);

                                setForms((prev) => ({
                                    ...prev,
                                    patientAddress: newValue
                                }));
                            }}
                            onInputChange={(e, value, reason) => {
                                if (reason === "input") {
                                    setForms((prev) => ({
                                        ...prev,
                                        patientAddress: value
                                    }));
                                }
                            }}

                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    error={Boolean(errors.patientAddress)}
                                    helperText={errors.patientAddress}
                                    label="City / District"
                                    placeholder="Search or select city"
                                    sx={inputSx}
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <>
                                                <InputAdornment position="start">
                                                    <LocationOnOutlinedIcon fontSize="small" sx={{ color: "#667085" }} />
                                                </InputAdornment>
                                                {params.InputProps.startAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
                    <Button
                        disabled={isSavingCamp}
                        type="button"
                        variant="outlined"
                        startIcon={<RestartAltIcon />}
                        onClick={handleReset}
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: "10px",
                            borderColor: "#D0D5DD",
                            color: "#344054",
                            px: 2.5,
                            "&:hover": { borderColor: "#98A2B3", backgroundColor: "#F9FAFB" },
                        }}
                    >
                        Clear
                    </Button>
                    <Button
                        disabled={isSavingCamp}
                        type="submit"
                        variant="contained"
                        startIcon={<CheckCircleOutlineIcon />}
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: "10px",
                            backgroundColor: "#155EEF",
                            boxShadow: "none",
                            px: 3,
                            "&:hover": { backgroundColor: "#0B4EC9", boxShadow: "none" },
                        }}
                    >
                        {isSavingCamp ? <CircularProgress size={22} /> : " Register Patient"}
                    </Button>
                </Stack>
            </Box>
        </Box >
    );
};