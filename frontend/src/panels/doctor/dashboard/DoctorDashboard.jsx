import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    Grid,
    Paper,
    Card,
    CardContent,
    CardHeader,
    Button,
    Typography,
    Chip,
    LinearProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
    Person as PersonIcon,
    Event as EventIcon,
    Assignment as AssignmentIcon,
    Notifications as NotificationsIcon,
    Speed as SpeedIcon,
    TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { tokens } from "../../../theme";
import { UserContextHook } from "../../../contexts/UserContexts";

const DoctorDashboard = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { currentUser } = UserContextHook();
    const [stats, setStats] = useState({
        todayAppointments: 8,
        totalPatients: 156,
        pendingConsultations: 5,
        emergencyAlerts: 2,
        averageRating: 4.7,
        consultationRate: 92,
    });

    const StatCard = ({ title, value, icon: Icon, color, unit = "" }) => (
        <Card sx={{ height: "100%", backgroundColor: colors.primary[400] }}>
            <CardContent>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                >
                    <Box>
                        <Typography color={colors.gray[100]} variant="body2" mb={1}>
                            {title}
                        </Typography>
                        <Typography
                            color={color}
                            variant="h4"
                            fontWeight="bold"
                            display="flex"
                            alignItems="baseline"
                        >
                            {value}
                            {unit && <span style={{ fontSize: "0.8em", marginLeft: "4px" }}>{unit}</span>}
                        </Typography>
                    </Box>
                    <Icon sx={{ color, fontSize: "2.5rem", opacity: 0.7 }} />
                </Box>
            </CardContent>
        </Card>
    );

    const UpcomingAppointmentCard = () => (
        <Card sx={{ backgroundColor: colors.primary[400] }}>
            <CardHeader
                title="Today's Appointments"
                subheader="8 scheduled consultations"
                titleTypographyProps={{ color: colors.gray[100] }}
                subheaderTypographyProps={{ color: colors.gray[300] }}
            />
            <CardContent>
                <Box display="flex" flexDirection="column" gap={2}>
                    {[1, 2, 3].map((item) => (
                        <Box
                            key={item}
                            p={1.5}
                            bgcolor={colors.primary[500]}
                            borderRadius="8px"
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Box>
                                <Typography color={colors.gray[100]} variant="subtitle2">
                                    Patient {item}
                                </Typography>
                                <Typography color={colors.gray[300]} variant="caption">
                                    {10 + item}:30 AM - {10 + item}:45 AM
                                </Typography>
                            </Box>
                            <Chip label="Scheduled" size="small" color="success" variant="outlined" />
                        </Box>
                    ))}
                </Box>
                <Button fullWidth variant="contained" sx={{ mt: 2 }}>
                    View All Appointments
                </Button>
            </CardContent>
        </Card>
    );

    const RecentConsultationsCard = () => (
        <Card sx={{ backgroundColor: colors.primary[400] }}>
            <CardHeader
                title="Recent Consultations"
                subheader="Last 5 consultations"
                titleTypographyProps={{ color: colors.gray[100] }}
                subheaderTypographyProps={{ color: colors.gray[300] }}
            />
            <CardContent>
                <Box display="flex" flexDirection="column" gap={2}>
                    {[1, 2, 3, 4, 5].map((item) => (
                        <Box
                            key={item}
                            p={1}
                            borderBottom={`1px solid ${colors.primary[500]}`}
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Box>
                                <Typography color={colors.gray[100]} variant="subtitle2">
                                    Patient Name {item}
                                </Typography>
                                <Typography color={colors.gray[300]} variant="caption">
                                    {["OPD", "Follow-up", "Emergency"][item % 3]} Consultation
                                </Typography>
                            </Box>
                            <Typography color={colors.gray[300]} variant="caption">
                                {item}h ago
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Welcome Section */}
            <Box mb={4}>
                <Typography variant="h3" color={colors.gray[100]} fontWeight="bold" mb={1}>
                    Welcome, Dr. {currentUser?.name || "Doctor"}
                </Typography>
                <Typography color={colors.gray[300]} variant="body1">
                    Here's your daily overview and upcoming consultations
                </Typography>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={2} mb={4}>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Today's Appointments"
                        value={stats.todayAppointments}
                        icon={EventIcon}
                        color={colors.blueAccent[400]}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Pending Consultations"
                        value={stats.pendingConsultations}
                        icon={AssignmentIcon}
                        color={colors.yellowAccent[400]}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Emergency Alerts"
                        value={stats.emergencyAlerts}
                        icon={NotificationsIcon}
                        color={colors.redAccent[400]}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Total Patients"
                        value={stats.totalPatients}
                        icon={PersonIcon}
                        color={colors.greenAccent[400]}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Avg. Rating"
                        value={stats.averageRating}
                        icon={TrendingUpIcon}
                        color={colors.blueAccent[400]}
                        unit="/5"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Consultation Rate"
                        value={stats.consultationRate}
                        icon={SpeedIcon}
                        color={colors.greenAccent[400]}
                        unit="%"
                    />
                </Grid>
            </Grid>

            {/* Main Content Grid */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                    <UpcomingAppointmentCard />
                </Grid>
                <Grid item xs={12} md={5}>
                    <RecentConsultationsCard />
                </Grid>
            </Grid>

            {/* Quick Actions */}
            <Box mt={4}>
                <Typography variant="h5" color={colors.gray[100]} fontWeight="bold" mb={2}>
                    Quick Actions
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                    <Button variant="contained" color="primary">
                        Start New Consultation
                    </Button>
                    <Button variant="outlined" color="primary">
                        View All Appointments
                    </Button>
                    <Button variant="outlined" color="primary">
                        Check Emergency Alerts
                    </Button>
                    <Button variant="outlined" color="primary">
                        Manage Schedule
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default DoctorDashboard;
