import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Grid,
  Box,
  Chip,
  Card,
  CardContent,
  Avatar,
  Stack,
  Slide,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventNoteIcon from "@mui/icons-material/EventNote";
import StarIcon from "@mui/icons-material/Star";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import VideocamIcon from "@mui/icons-material/Videocam";
import PolicyIcon from "@mui/icons-material/Policy";
import InfoIcon from "@mui/icons-material/Info";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { format } from "date-fns";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ViewDoctorModal = ({ open, onClose, doctorData }) => {
  if (!open || !doctorData) {
    return null;
  }

  // Helper to format time if timings are Date objects (e.g., from Dayjs conversion)
  const formatTime = (time) => {
    if (time instanceof Date) {
      return format(time, 'hh:mm a'); // e.g., "09:00 AM"
    }
    return time || 'N/A'; // Fallback if not a Date object or null
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      TransitionComponent={Transition}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 3,
          px: 4,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              bgcolor: 'primary.dark',
              mr: 2,
              width: 48,
              height: 48,
            }}
          >
            <MedicalServicesIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              Doctor Details
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {doctorData.name || "Doctor Information"}
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={onClose} 
          sx={{ 
            color: "white",
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.1)',
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {/* Basic Information Card */}
            <Grid item xs={12}>
              <Card
                elevation={1}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      bgcolor: 'secondary.main',
                      color: 'white',
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <PersonIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Basic Information
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            DOCTOR NAME
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {doctorData.name || "N/A"}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            OPD NUMBER
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {doctorData.opdNo || "N/A"}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            DEGREES
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {((doctorData.degrees || []).length > 0 || (doctorData.customDegrees || []).length > 0) ? (
                              <>
                                {(doctorData.degrees || []).map((degree, index) => (
                                  <Chip 
                                    key={`degree-${index}`} 
                                    label={degree} 
                                    color="info" 
                                    variant="outlined" 
                                    size="small"
                                  />
                                ))}
                                {(doctorData.customDegrees || []).map((degree, index) => (
                                  <Chip 
                                    key={`custom-${index}`} 
                                    label={degree} 
                                    color="info" 
                                    variant="outlined" 
                                    size="small"
                                    sx={{ fontStyle: 'italic' }}
                                  />
                                ))}
                              </>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No degrees listed.
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            SPECIALTIES
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {doctorData.specialties && doctorData.specialties.length > 0 ? (
                              doctorData.specialties.map((specialty, index) => (
                                <Chip 
                                  key={index} 
                                  label={specialty} 
                                  color="primary" 
                                  variant="outlined" 
                                  size="small"
                                />
                              ))
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No specialties listed.
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            SUB-DEPARTMENT
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {doctorData.subDepartment || "N/A"}
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Professional Details Card */}
            <Grid item xs={12}>
              <Card
                elevation={1}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      bgcolor: 'secondary.main',
                      color: 'white',
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <MedicalServicesIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Professional Details
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            MORNING TIMINGS
                          </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {doctorData.timings?.morning ? formatTime(doctorData.timings.morning) : "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            EVENING TIMINGS
                          </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {doctorData.timings?.evening ? formatTime(doctorData.timings.evening) : "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <EventNoteIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            OPD DAYS
                          </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {doctorData.opdDays || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <StarIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            EXPERIENCE
                          </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {doctorData.experience || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <CurrencyRupeeIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            CONSULTATION CHARGES
                          </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {doctorData.consultationCharges || "N/A"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Contact Information Card */}
            <Grid item xs={12}>
              <Card
                elevation={1}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      bgcolor: 'secondary.main',
                      color: 'white',
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <PhoneIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Contact Information
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            CONTACT NUMBER
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {doctorData.contactNumber || "N/A"}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            EXTENSION NUMBER
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {doctorData.extensionNumber || "N/A"}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            PA NAME
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {doctorData.paName || "N/A"}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            PA CONTACT NUMBER
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {doctorData.paContactNumber || "N/A"}
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Digital Services Card */}
            <Grid item xs={12}>
              <Card
                elevation={1}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      bgcolor: 'secondary.main',
                      color: 'white',
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <VideocamIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Digital Services
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            VIDEO CONSULTATION
                          </Typography>
                          <Chip
                            label={doctorData.videoConsultation?.enabled ? "Enabled" : "Disabled"}
                            color={doctorData.videoConsultation?.enabled ? "success" : "error"}
                            size="small"
                          />
                        </Stack>
                      </Grid>
                      
                      {doctorData.videoConsultation?.enabled && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <Stack spacing={1}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                VIDEO CONSULTATION TIME SLOT
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {doctorData.videoConsultation?.timeSlot || "N/A"}
                              </Typography>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Stack spacing={1}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                VIDEO CONSULTATION CHARGES
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {doctorData.videoConsultation?.charges || "N/A"}
                              </Typography>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Stack spacing={1}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                VIDEO CONSULTATION DAYS
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {doctorData.videoConsultation?.days || "N/A"}
                              </Typography>
                            </Stack>
                          </Grid>
                        </>
                      )}
                      
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            TELEMEDICINE STATUS
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {doctorData.teleMedicine || "N/A"}
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Other Information Card */}
            <Grid item xs={12}>
              <Card
                elevation={1}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      bgcolor: 'secondary.main',
                      color: 'white',
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <InfoIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Other Information
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            EMPANELMENT LIST
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {doctorData.empanelmentList && doctorData.empanelmentList.length > 0 ? (
                              doctorData.empanelmentList.map((item, index) => (
                                <Chip 
                                  key={index} 
                                  label={item} 
                                  color="warning" 
                                  variant="outlined" 
                                  icon={<PolicyIcon />}
                                  size="small"
                                />
                              ))
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No empanelment listed.
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            ADDITIONAL INFORMATION
                          </Typography>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              bgcolor: 'background.default',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          >
                            <Typography variant="body2" sx={{ lineHeight: 1.6, fontStyle: 'italic' }}>
                              {doctorData.additionalInfo || "No additional information available"}
                            </Typography>
                          </Paper>
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            DOCTOR STATUS
                          </Typography>
                          <Chip
                            label={doctorData.isEnabled ? "Enabled" : "Disabled"}
                            color={doctorData.isEnabled ? "success" : "error"}
                            size="small"
                            icon={doctorData.isEnabled ? <CheckCircleOutlineIcon /> : <CloseIcon />}
                          />
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions
        sx={{
          p: 3,
          bgcolor: 'background.default',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewDoctorModal;