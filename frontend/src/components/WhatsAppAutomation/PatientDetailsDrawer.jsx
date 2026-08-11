import { Box, Button, Chip, Divider, Drawer, Stack, Typography } from "@mui/material";
import { Close, PersonOutline } from "@mui/icons-material";

const PatientDetailsDrawer = ({ open, onClose, patient }) => {
    if (!patient) return null;

    const detailRows = [
        ["Name", patient.name],
        ["UHID", patient.uhid],
        ["Age", `${patient.age} yrs`],
        ["Gender", patient.gender],
        ["Blood Group", patient.bloodGroup],
        ["Phone Number", patient.mobile],
        ["Email", patient.email],
        ["Hospital", patient.hospital],
        ["Branch", patient.branch],
        ["Department", patient.department],
        ["Assigned Doctor", patient.doctor],
        ["Last Visit", patient.lastVisit],
        ["Upcoming Appointment", patient.upcomingAppointment],
        ["Total Appointments", patient.totalAppointments],
        ["Pending Bills", patient.pendingBills],
    ];

    return (
        <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: "100%", sm: 440 }, p: 0 } }}>
            <Box sx={{ p: 3, height: "100%", bgcolor: "background.default" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                        <PersonOutline color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Patient Profile
                        </Typography>
                    </Stack>
                    <Button variant="outlined" size="small" onClick={onClose} startIcon={<Close />}>
                        Close
                    </Button>
                </Stack>

                <Divider sx={{ mb: 2 }} />

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Complete patient profile and current care context for this conversation.
                </Typography>

                <Stack spacing={1.2} sx={{ mb: 2 }}>
                    {detailRows.map(([label, value]) => (
                        <Box key={label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid", borderColor: "divider", pb: 0.8 }}>
                            <Typography variant="body2" color="text.secondary">{label}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "right" }}>{value}</Typography>
                        </Box>
                    ))}
                </Stack>

                <Chip label="Medical Notes" color="primary" sx={{ mb: 1 }} />
                <Typography variant="body2" sx={{ mb: 2 }}>{patient.medicalNotes}</Typography>

                <Chip label="Current Medications" color="secondary" sx={{ mb: 1 }} />
                <Stack direction="row" spacing={1} flexWrap="wrap">
                    {patient.medications.map((entry) => (
                        <Chip key={entry} label={entry} variant="outlined" />
                    ))}
                </Stack>
            </Box>
        </Drawer>
    );
}

export default PatientDetailsDrawer;
