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
  Divider,
  Paper,
  Switch,
  Chip,
  Card,
  CardContent,
  Avatar,
  Stack,
  Slide,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import CodeIcon from "@mui/icons-material/Code";
import PaletteIcon from "@mui/icons-material/Palette";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import PeopleIcon from "@mui/icons-material/People";
import WorkIcon from "@mui/icons-material/Work";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { tokens } from "../../../../../theme";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ViewCodeAnnouncementModal = ({ open, onClose, announcementData }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // If no announcementData is provided or the modal is closed, don't render
  if (!open || !announcementData) {
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
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
            <AnnouncementIcon sx={{ fontSize: 24,  }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              Code Announcement Details
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {announcementData.name || "Announcement Information"}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'white',
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
            {/* General Information Card */}
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
                    <AnnouncementIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      General Information
                    </Typography>
                  </Box>

                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }} >
                          <AnnouncementIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            ANNOUNCEMENT NAME
                          </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                          {announcementData.name || "N/A"}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <CodeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            SHORT CODE
                          </Typography>
                        </Stack>
                        <Chip
                          label={announcementData.shortCode || "N/A"}
                          size="small"
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            fontWeight: 600,
                            letterSpacing: 0.5,
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <PaletteIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            COLOR
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1,
                              bgcolor: announcementData.color || "grey.300",
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {announcementData.color || "N/A"}
                          </Typography>
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            TIME AVAILABILITY
                          </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {announcementData.timeAvailability || "N/A"}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <PersonIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            CONCERNED PERSON
                          </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {announcementData.concernedPerson || "N/A"}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            STATUS
                          </Typography>
                        </Stack>
                        <Chip
                          icon={announcementData.enabled ? <CheckCircleIcon /> : <CancelIcon />}
                          label={announcementData.enabled ? "Enabled" : "Disabled"}
                          color={announcementData.enabled ? "success" : "error"}
                          sx={{
                            fontWeight: 600,
                            '& .MuiChip-icon': {
                              fontSize: 16,
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1 }}>
                          <DescriptionIcon sx={{ fontSize: 16, color: 'primary.main', mt: 0.5 }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            DESCRIPTION
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
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {announcementData.description || "No description available"}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Staff Members Card */}
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
                    <PeopleIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Staff Members
                    </Typography>
                    <Chip
                      label={announcementData.staff?.length || 0}
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
                    {announcementData.staff && announcementData.staff.length > 0 ? (
                      <Grid container spacing={2}>
                        {announcementData.staff.map((staffMember, index) => (
                          <Grid item xs={12} sm={6} md={4} key={staffMember.id || index}>
                            <Card
                              elevation={1}
                              sx={{
                                borderRadius: 2,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: 2,
                                },
                              }}
                            >
                              <CardContent sx={{ p: 2.5 }}>
                                <Stack spacing={2}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Avatar
                                      sx={{
                                        bgcolor: 'primary.main',
                                        width: 40,
                                        height: 40,
                                        mr: 1.5,
                                      }}
                                    >
                                      <PersonIcon sx={{ fontSize: 20 }} />
                                    </Avatar>
                                    <Box>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        {staffMember.name || "N/A"}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Staff Member
                                      </Typography>
                                    </Box>
                                  </Box>

                                  <Stack spacing={1}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <WorkIcon sx={{ fontSize: 14, color: 'text.secondary', mr: 1 }} />
                                      <Typography variant="body2" color="text.secondary">
                                        Shift:
                                      </Typography>
                                      <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                                        {staffMember.shift || "N/A"}
                                      </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <PhoneInTalkIcon sx={{ fontSize: 14, color: 'text.secondary', mr: 1 }} />
                                      <Typography variant="body2" color="text.secondary">
                                        Contact:
                                      </Typography>
                                      <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                                        {staffMember.contactNo || "N/A"}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </Stack>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Box
                        sx={{
                          textAlign: 'center',
                          py: 6,
                          px: 3,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: 'action.hover',
                            width: 64,
                            height: 64,
                            mx: 'auto',
                            mb: 2,
                          }}
                        >
                          <PeopleIcon sx={{ fontSize: 32, color: 'text.secondary' }} />
                        </Avatar>
                        <Typography
                          variant="h6"
                          color="text.secondary"
                          sx={{ mb: 1, fontWeight: 500 }}
                        >
                          No Staff Members
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ opacity: 0.8 }}
                        >
                          There are no staff members associated with this announcement.
                        </Typography>
                      </Box>
                    )}
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

export default ViewCodeAnnouncementModal;