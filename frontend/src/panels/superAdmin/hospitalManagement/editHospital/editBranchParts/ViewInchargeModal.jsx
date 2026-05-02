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
  Card,
  CardContent,
  Avatar,
  Stack,
  Slide,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person"; // For incharge name
import PhoneIcon from "@mui/icons-material/Phone"; // For contact details
import PhoneCallbackIcon from "@mui/icons-material/PhoneCallback"; // For extension number
import BusinessIcon from "@mui/icons-material/Business"; // For department name
import AccessTimeIcon from "@mui/icons-material/AccessTime"; // For time slot
import SettingsEthernetIcon from "@mui/icons-material/SettingsEthernet"; // For service type

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ViewDepartmentInchargeModal = ({ open, onClose, inchargeData }) => {
  // If no inchargeData is provided or the modal is closed, don't render
  if (!open || !inchargeData) {
    return null;
  }

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
              bgcolor: 'success.main',
              mr: 2,
              width: 48,
              height: 48,
            }}
          >
            <PersonIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              Department Incharge Details
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {inchargeData.name || "Incharge Information"}
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
            {/* Incharge Information Card */}
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
                      Incharge Information
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <Stack spacing={1}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        INCHARGE NAME
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {inchargeData.name || "N/A"}
                      </Typography>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Contact Details Card */}
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
                      Contact Details
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <PhoneIcon sx={{ fontSize: 16, color: 'info.main' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            CONTACT NUMBER
                          </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {inchargeData.contactNo || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <PhoneCallbackIcon sx={{ fontSize: 16, color: 'info.main' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            EXTENSION NUMBER
                          </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {inchargeData.extensionNo || "N/A"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Department & Service Card */}
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
                    <BusinessIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Department & Service
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            DEPARTMENT NAME
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {inchargeData.departmentName || "N/A"}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            TIME SLOT
                          </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {inchargeData.timeSlot || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <SettingsEthernetIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            SERVICE TYPE
                          </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {inchargeData.serviceType || "N/A"}
                        </Typography>
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

export default ViewDepartmentInchargeModal;