import React from "react";
import {
    Card,
    CardContent,
    Avatar,
    Typography,
    Grid,
    Chip,
    Stack,
    Divider,
    Box,
    CircularProgress
} from "@mui/material";
import PolicyIcon from "@mui/icons-material/Policy";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import { commonRoutes } from "../api/apiService";
import { useState } from "react";
import { useEffect } from "react";
import { useApi } from "../api/useApi";

const doctor = {
    _id: "69b51716b29cf7c642e8adbc",

    name: "Dr. Rajesh Sharma",

    department: {
        _id: "dep123",
        name: "Cardiology"
    },

    specialties: [
        {
            _id: "sp1",
            name: "Physician"
        }
    ],

    qualification: ["MBBS", "MD", "DM"],

    experience: 12,

    profilePicture: {
        url: "https://res.cloudinary.com/dja0qks2v/image/upload/v1773475605/images/ptwd38mnzvfymog4ggar.jpg"
    },

    timings: {
        start: "10:00 AM",
        end: "2:00 PM"
    },

    opdDays: ["Mon", "Wed", "Fri"],

    empanelmentList: [
        {
            _id: "emp1",
            name: "CGHS",
            treatableAreas: [
                { _id: "t1", name: "Heart Attack" },
                { _id: "t2", name: "Arrhythmia" }
            ]
        },
        {
            _id: "emp2",
            name: "ESIC",
            treatableAreas: [{ _id: "t3", name: "Hypertension" }]
        }
    ],

    procedures: [
        { _id: "p1", name: "Angiography" },
        { _id: "p2", name: "ECG" },
        { _id: "p3", name: "Echo" }
    ],

    surgeries: [
        { _id: "s1", name: "Bypass Surgery" },
        { _id: "s2", name: "Angioplasty" }
    ]
};

const chipStyles = {
    opd: { bgcolor: "#E3F2FD", color: "#1976D2" },
    specialties: { bgcolor: "#FFF3E0", color: "#F57C00" },
    surgeries: { bgcolor: "#F3E5F5", color: "#7B1FA2" },
};

const DoctorProfileCard = ({ doctor, hosId }) => {



    const [profile, setProfile] = useState(null)

    const { request: getSingledoctor, loading: getSingleDocorLoading } =
        useApi(commonRoutes.getSingleDoctor)

    useEffect(() => {

        if (!doctor?._id) return

        const getaprofile = async () => {
            try {
                const res = await getSingledoctor(hosId, doctor._id)
                setProfile(res?.data)
            } catch (err) {
                console.error("Doctor fetch error", err)
            }
        }

        getaprofile()

    }, [doctor])


    if (!doctor) {
        return (
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="h6" align="center">
                        No doctor data available
                    </Typography>
                </CardContent>
            </Card>
        )
    }

    const data = profile || doctor   // fallback

    return (
        <Card
            variant="outlined"
            sx={{
                margin: "10px 0 10px 0",
                borderRadius: 2,
                "& .MuiChip-root": { height: 20, fontSize: "11px" }
            }}
        >

            <CardContent sx={{ p: 1.5 }}>

                {/* TOP SECTION */}
                <Grid container spacing={1} alignItems="center">

                    {/* Avatar */}
                    <Grid item>
                        <Avatar
                            src={data?.profilePicture?.imagePath}
                            alt={data?.name}
                            sx={{ width: 60, height: 60 }}
                        />

                        <Typography fontSize={10} textAlign="center">
                            OPD: {data?.opdNo || "-"}
                        </Typography>
                    </Grid>


                    {/* Doctor Info */}
                    <Grid item xs>

                        <Typography fontSize={15} fontWeight={600}>
                            {data?.title} {data?.name} ({data?.masters})
                        </Typography>

                        <Typography fontSize={12} color="text.secondary">
                            {data?.designation} • {data?.department?.name}
                        </Typography>
                        <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap">

                            <Chip
                                label={`${data?.experience || 0}y exp`}
                                size="small"
                                color="primary"
                            />

                            {data?.degrees?.map((deg, i) => (
                                <Chip key={i} label={deg} size="small" />
                            ))}

                            <Chip
                                label={`₹${data?.consultationCharges}`}
                                size="small"
                                color="success"
                            />

                        </Stack>

                    </Grid>

                    {/* Timings */}
                    <Grid item>

                        <Typography fontSize={11} fontWeight={600}>
                            Timings
                        </Typography>

                        {data?.timings?.morning?.start && (
                            <Typography fontSize={11}>
                                M: {data?.timings?.morning?.start}-{data?.timings?.morning?.end}
                            </Typography>
                        )}

                        {data?.timings?.evening?.start && (
                            <Typography fontSize={11}>
                                E: {data?.timings?.evening?.start}-{data?.timings?.evening?.end}
                            </Typography>
                        )}

                        {data?.timings?.custom?.start && (
                            <Typography fontSize={11}>
                                C: {data?.timings?.custom?.start}-{data?.timings?.custom?.end}
                            </Typography>
                        )}

                    </Grid>

                </Grid>

                <Divider sx={{ my: 1 }} />

                {/* OPD DAYS */}

                <Box mb={1} sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: 'space-between' }}>
                    <Box>

                        <Typography fontSize={12} fontWeight={600} mb={0.5}>
                            OPD Days
                        </Typography>

                        <Stack direction="row" spacing={0.5} flexWrap="wrap">

                            {data?.opdDays?.map((day, i) => (
                                <Chip key={i} label={day} size="small" sx={chipStyles.opd} />
                            ))}

                        </Stack>
                    </Box>

                    <Box>

                        <Typography fontSize={12} fontWeight={600} mb={0.5}>
                            Treatable Areas
                        </Typography>

                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {data?.specialties?.map((day, i) => (
                                <Chip key={i} label={day?.value || "Unknown"} size="small" sx={chipStyles.specialties} />
                            ))}
                        </Stack>
                    </Box>

                    <Box>

                        <Typography fontSize={12} fontWeight={600} mb={0.5}>
                            Surgeries
                        </Typography>

                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {data?.surgeries?.map((day, i) => (
                                <Chip key={i} label={day?.value || "Unknown"} size="small" sx={chipStyles.surgeries} />
                            ))}

                        </Stack>
                    </Box>

                </Box>

                <Divider sx={{ my: 1 }} />

                <Grid container spacing={1}>

                    {/* EMPANELMENTS */}
                    <Grid item xs={12} md={6}>

                        <Typography fontSize={12} fontWeight={600} mb={0.5}>
                            <PolicyIcon sx={{ fontSize: 16 }} color="info" /> Empanelments
                        </Typography>

                        {data?.empanelments?.map((emp) => (

                            <Box key={emp._id} mb={0.5}>

                                <Typography fontSize={11} fontWeight={600}>
                                    {emp?.policyName}
                                </Typography>

                                <Stack direction="row" spacing={0.5} flexWrap="wrap">

                                    {emp?.coverageOptions
                                        ?.flatMap(o => o.treatableAreas || [])
                                        ?.filter(Boolean)
                                        ?.map((area, i) => (

                                            <Chip
                                                key={area?._id || i}
                                                label={area?.value || "Unknown"}
                                                size="small"
                                            />

                                        ))}

                                </Stack>

                            </Box>

                        ))}

                    </Grid>


                    {/* PROCEDURES */}

                    <Grid item xs={12} md={6}>

                        <Typography fontSize={12} fontWeight={600} mb={0.5}>
                            <MedicalServicesIcon sx={{ fontSize: 16 }} color="warning" /> Procedures
                        </Typography>

                        <Stack direction="row" spacing={0.5} flexWrap="wrap">

                            {data?.procedures?.map((proc) => (

                                <Chip
                                    key={proc._id}
                                    label={`${proc.name} ₹${proc?.ratesCharges}`}
                                    size="small"
                                    color="info"
                                />

                            ))}

                        </Stack>

                    </Grid>

                </Grid>

            </CardContent>

        </Card>
    );
}

export default DoctorProfileCard