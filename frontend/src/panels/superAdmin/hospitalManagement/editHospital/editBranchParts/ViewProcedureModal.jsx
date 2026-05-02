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
import HealingIcon from "@mui/icons-material/Healing"; // For procedure name
import InfoIcon from "@mui/icons-material/Info"; // For description
import CategoryIcon from "@mui/icons-material/Category"; // For category
import PersonIcon from "@mui/icons-material/Person"; // For doctors/coordinators
import BusinessIcon from "@mui/icons-material/Business"; // For empanelment type
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"; // For rates/charges
import DescriptionIcon from "@mui/icons-material/Description";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ViewProcedureModal = ({ open, onClose, procedureData }) => {
  // If no procedureData is provided or the modal is closed, don't render
  if (!open || !procedureData) {
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
            <HealingIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              Procedure Details
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {procedureData.name || "Procedure Information"}
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
            {/* Procedure Information Card */}
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
                    <HealingIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Procedure Information
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            PROCEDURE NAME
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {procedureData.name || "N/A"}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <CategoryIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            CATEGORY
                          </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {procedureData.category || "N/A"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Description Card */}
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
                    <DescriptionIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Description
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
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
                      <Typography variant="body2" sx={{ lineHeight: 1.6, fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
                        {procedureData.description || "No description provided."}
                      </Typography>
                    </Paper>
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
                      label={procedureData.doctorName?.length || 0}
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
                      {procedureData.doctorName &&
                      procedureData.doctorName.length > 0 ? (
                        procedureData.doctorName.map((doctorName, index) => (
                          <Chip
                            key={index}
                            label={doctorName}
                            color="success"
                            variant="outlined"
                            size="small"
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No doctors assigned.
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Empanelment Types Card */}
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
                      Empanelment Types
                    </Typography>
                    <Chip
                      label={procedureData.empanelmentType?.length || 0}
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
                      {procedureData.empanelmentType &&
                      procedureData.empanelmentType.length > 0 ? (
                        procedureData.empanelmentType.map((type, index) => (
                          <Chip
                            key={index}
                            label={type}
                            color="secondary"
                            variant="outlined"
                            size="small"
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No empanelment types specified.
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Financial & Coordination Card */}
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
                    <AttachMoneyIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Financial & Coordination
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <CurrencyRupeeIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            RATES/CHARGES
                          </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {procedureData.ratesCharges
                            ? `₹${procedureData.ratesCharges}`
                            : "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <PersonIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            COORDINATORS
                          </Typography>
                        </Stack>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {procedureData.coordinatorName &&
                          procedureData.coordinatorName.length > 0 ? (
                            procedureData.coordinatorName.map((coordinator, index) => (
                              <Chip
                                key={index}
                                label={coordinator}
                                color="warning"
                                variant="outlined"
                                size="small"
                              />
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No coordinators assigned.
                            </Typography>
                          )}
                        </Box>
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

export default ViewProcedureModal;
