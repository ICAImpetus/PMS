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
import ScienceIcon from "@mui/icons-material/Science";
import CodeIcon from "@mui/icons-material/Code";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CategoryIcon from "@mui/icons-material/Category";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import DescriptionIcon from "@mui/icons-material/Description";
import WarningIcon from "@mui/icons-material/Warning";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ViewTestLabModal = ({ open, onClose, testLabData }) => {
  // If no testLabData is provided or the modal is closed, don't render
  if (!open || !testLabData) {
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
              bgcolor: 'primary.dark',
              mr: 2,
              width: 48,
              height: 48,
            }}
          >
            <ScienceIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              Test Lab Details
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {testLabData.testName || "Test Information"}
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
            {/* Test Information Card */}
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
                    <ScienceIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Test Information
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            TEST NAME
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {testLabData.testName || "N/A"}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <CodeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            TEST CODE
                          </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {testLabData.testCode || "N/A"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Location Details Card */}
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
                    <LocationOnIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Location Details
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            LOCATION
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {testLabData.location || "N/A"}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            FLOOR
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {testLabData.floor || "N/A"}
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Service & Charges Card */}
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
                      Service & Charges
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <GroupWorkIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            SERVICE GROUP
                          </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {testLabData.serviceGroup || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <CurrencyRupeeIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            SERVICE CHARGE
                          </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {testLabData.serviceCharge ? `₹${testLabData.serviceCharge}` : "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            TAT REPORT
                          </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {testLabData.tatReport || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <SystemUpdateAltIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            SOURCE
                          </Typography>
                        </Stack>
                        <Chip
                          label={testLabData.source || "N/A"}
                          color={testLabData.source === "In" ? "success" : testLabData.source === "Out" ? "warning" : "default"}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Category Applicability Card */}
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
                    <CategoryIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Category Applicability
                    </Typography>
                    <Chip
                      label={testLabData.categoryApplicability?.length || 0}
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
                      {testLabData.categoryApplicability &&
                      testLabData.categoryApplicability.length > 0 ? (
                        testLabData.categoryApplicability.map((category, index) => (
                          <Chip
                            key={index}
                            label={category}
                            color="secondary"
                            variant="outlined"
                            size="small"
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No categories specified.
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Additional Information Card */}
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
                      Additional Information
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            DESCRIPTION
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
                            <Typography variant="body2" sx={{ lineHeight: 1.6, fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
                              {testLabData.description || "No description provided."}
                            </Typography>
                          </Paper>
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <WarningIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              PRECAUTION
                            </Typography>
                          </Stack>
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
                              {testLabData.precaution || "No specific precautions."}
                            </Typography>
                          </Paper>
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            REMARKS
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
                            <Typography variant="body2" sx={{ lineHeight: 1.6, fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
                              {testLabData.remarks || "No additional remarks."}
                            </Typography>
                          </Paper>
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

export default ViewTestLabModal;