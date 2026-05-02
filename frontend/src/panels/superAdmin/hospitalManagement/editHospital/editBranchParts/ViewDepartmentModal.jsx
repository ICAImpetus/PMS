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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ViewDepartmentModal = ({ open, onClose, departmentData }) => {
  // If no departmentData is provided, or the modal is closed, don't render
  if (!open || !departmentData) {
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
            <BusinessIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              Department Details
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {departmentData.name || "Department Information"}
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
            {/* Department Information Card */}
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
                      Department Information
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <Stack spacing={1}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        DEPARTMENT NAME
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {departmentData.name || "N/A"}
                      </Typography>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Associated Doctors Card */}
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
                      Associated Doctors
                    </Typography>
                    <Chip
                      label={departmentData.doctors?.length || 0}
                      size="small"
                      sx={{
                        ml: 2,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {departmentData.doctors && departmentData.doctors.length > 0 ? (
                        departmentData.doctors.map((doctor) => (
                          <Chip
                            key={doctor.id || doctor.opdNo}
                            label={doctor.name}
                            color="success"
                            variant="outlined"
                            size="small"
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No doctors associated.
                        </Typography>
                      )}
                    </Box>
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

export default ViewDepartmentModal;