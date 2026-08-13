import "./ProfilePopup.css";
import { useEffect, useState } from "react";
import {
  TextField, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, IconButton,
  Box,
  Paper,
  Avatar,
  Typography,
  CircularProgress,
  Divider
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CampaignIcon from "@mui/icons-material/Campaign";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LockResetIcon from "@mui/icons-material/LockReset";

import LogoutIcon from "@mui/icons-material/Logout";
import { commonRoutes } from "../../api/apiService";
import { useApi } from "../../api/useApi";
import { toast } from "react-toastify";
import { UserContextHook } from "../../contexts/UserContexts";
import LogoutModal from "../../components/LogoutModal";
import { logoutApi } from "../../utils/services";

export const ProfilePopup = ({ onClose }) => {

  const { currentUser, setCurrentUser } = UserContextHook();
  const userType = currentUser?.type;
  const isSuperAdmin = userType === "superadmin";

  // State for modals
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Profile update state
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    username: currentUser?.username || "",
    type: currentUser?.type || "",
    mongoId: currentUser?.mongoId || currentUser?._id,
  });

  const { request: updateUser, loading: updateLoading } = useApi(
    commonRoutes.updateUser
  );

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const { request: updateUserPassword, loading: passwordLoading } = useApi(
    commonRoutes.updateUserPassword
  );

  // Handlers
  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  // Profile Update Submit
  const handleProfileSubmit = async () => {
    try {
      if (!profileForm?.mongoId) {
        toast.error("User Not Found");
        return;
      }

      const res = await updateUser(profileForm?.mongoId, profileForm);

      if (res?.success && res?.data) {
        localStorage.setItem("current_user", JSON.stringify(res.data));
        setCurrentUser(res.data);
        toast.success("Profile updated successfully");
        setOpenProfileModal(false);
      } else {
        toast.error(res?.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error("Error updating profile");
    }
  };

  // Password Change Submit
  const handlePasswordSubmit = async () => {
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const res = await updateUserPassword(
        profileForm?.username,
        passwordForm.newPassword
      );
      if (res?.success) {
        toast.success("Password changed successfully");
        setOpenPasswordModal(false);
        setPasswordForm({ newPassword: "", confirmPassword: "" });
      } else {
        toast.error(res?.message || "Failed to change password");
      }
    } catch (err) {
      toast.error("Error changing password");
    }
  };

  // --- LOGOUT HANDLERS ---
  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logoutApi();
      return Promise.resolve();
    } catch (error) {
      console.error("Error during logout API call:", error);
      return Promise.reject(error);

    }
    // } finally {
    //   localStorage.clear();
    //   window.location.href = "/login";
    // }
  };

  const handleCloseLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          bgcolor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1300,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "90%",
            maxWidth: 420,
            bgcolor: "#FFFFFF",
            borderRadius: "24px",
            p: 3.5,
            border: "1px solid #E2E8F0",
            position: "relative",
            boxShadow: "0px 20px 25px -5px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              color: "#94A3B8",
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              "&:hover": { bgcolor: "#EFF6FF", color: "#0256E8" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          {/* Profile Header */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: "#DBEAFE",
                color: "#0256E8",
                fontWeight: 800,
                fontSize: "24px",
                mb: 1.5,
              }}
            >
              {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : "U"}
            </Avatar>
            <Typography variant="h6" fontWeight={800} color="#0F172A">
              {profileForm?.name || "User Profile"}
            </Typography>
            <Typography variant="caption" fontWeight={700} color="#0256E8">
              @{profileForm?.username || "username"}
            </Typography>
          </Box>

          <Divider sx={{ mb: 2.5, borderColor: "#F1F5F9" }} />

          {/* Profile Info Details */}
          <Box display="flex" flexDirection="column" gap={2} mb={3}>
            <Box bgcolor="#F8FAFC" p={1.5} borderRadius="12px" border="1px solid #E2E8F0">
              <Typography variant="caption" color="#94A3B8" fontWeight={700} fontSize="10px">
                EMAIL ADDRESS
              </Typography>
              <Typography variant="body2" color="#0F172A" fontWeight={600}>
                {profileForm?.email || "N/A"}
              </Typography>
            </Box>

            <Box bgcolor="#F8FAFC" p={1.5} borderRadius="12px" border="1px solid #E2E8F0">
              <Typography variant="caption" color="#94A3B8" fontWeight={700} fontSize="10px">
                ACCOUNT ROLE
              </Typography>
              <Typography variant="body2" color="#0F172A" fontWeight={600} sx={{ textTransform: "uppercase" }}>
                {profileForm?.type || "USER"}
              </Typography>
            </Box>
          </Box>

          {/* Actions */}
          <Box display="flex" flexDirection="column" gap={1.5}>
            {isSuperAdmin && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<EditOutlinedIcon />}
                  onClick={() => setOpenProfileModal(true)}
                  sx={{
                    borderRadius: "14px",
                    borderColor: "#CBD5E1",
                    color: "#334155",
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "12px",
                    py: 1,
                    "&:hover": { borderColor: "#0256E8", bgcolor: "#EFF6FF" },
                  }}
                >
                  Update Profile
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<LockResetIcon />}
                  onClick={() => setOpenPasswordModal(true)}
                  sx={{
                    borderRadius: "14px",
                    borderColor: "#CBD5E1",
                    color: "#334155",
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "12px",
                    py: 1,
                    "&:hover": { borderColor: "#0256E8", bgcolor: "#EFF6FF" },
                  }}
                >
                  {["supermanager", "admin", "superadmin"].includes(
                    profileForm.type?.toLowerCase()
                  )
                    ? "Change Password"
                    : "Request Password Change"}
                </Button>
              </>
            )}

            {/* Logout Button */}
            <Button
              variant="contained"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                borderRadius: "14px",
                bgcolor: "#EF4444",
                color: "#FFFFFF",
                textTransform: "none",
                fontWeight: 800,
                fontSize: "12px",
                py: 1.2,
                boxShadow: "0px 2px 6px rgba(239, 68, 68, 0.25)",
                "&:hover": {
                  bgcolor: "#DC2626",
                  boxShadow: "0px 4px 12px rgba(220, 38, 38, 0.35)",
                },
              }}
            >
              Logout Account
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Update Profile Dialog */}
      <Dialog
        open={openProfileModal}
        onClose={() => setOpenProfileModal(false)}
        PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Update Profile</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            name="name"
            value={profileForm.name}
            onChange={handleProfileChange}
            fullWidth
            size="small"
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            value={profileForm.email}
            onChange={handleProfileChange}
            fullWidth
            size="small"
          />
          <TextField
            margin="dense"
            label="Username"
            name="username"
            value={profileForm?.username}
            onChange={handleProfileChange}
            fullWidth
            disabled
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenProfileModal(false)}
            disabled={updateLoading}
            sx={{ color: "#64748B" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleProfileSubmit}
            disabled={updateLoading}
            variant="contained"
            sx={{ bgcolor: "#0256E8", borderRadius: "12px" }}
          >
            {updateLoading ? <CircularProgress size={20} color="inherit" /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={openPasswordModal}
        onClose={() => setOpenPasswordModal(false)}
        PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="New Password"
            name="newPassword"
            type="password"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            fullWidth
            size="small"
          />
          <TextField
            margin="dense"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            fullWidth
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenPasswordModal(false)}
            disabled={passwordLoading}
            sx={{ color: "#64748B" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePasswordSubmit}
            disabled={passwordLoading}
            variant="contained"
            sx={{ bgcolor: "#0256E8", borderRadius: "12px" }}
          >
            {passwordLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Change"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        open={isLogoutModalOpen}
        onClose={handleCloseLogoutModal}
        onLogout={handleLogoutConfirm}
      />
    </>
  );
};

export const CodeAnnousementPopup = ({ data, onClose, selectedHostpital, selectedBranch, refetchDashboard }) => {

  const { loading: createCodeAlertLoading, request: createCodeAlert, error: createCodeAlertError } = useApi(commonRoutes.createCodeAlert)
  const floors = ["Ground Floor", "First Floor", "ICU"];


  const [selectedCode, setSelectedCode] = useState(null);

  const [form, setForm] = useState({
    department: "",
    doctor: "",
    floor: "",
    wardNumber: "",
    bedNo: "",
    notes: "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleRaise = async () => {
    try {
      const payload = {
        HospitalId: selectedHostpital,
        BranchId: selectedBranch,
        depertmentId: form.department,
        doctorId: form.doctor,
        code_id: selectedCode?._id, // Using the _id of the announcement
        floor: form.floor,
        room: form.wardNumber,
        bed: form.bedNo,
        description: form.notes,
      };

      const res = await createCodeAlert(selectedHostpital, payload);
      if (res?.success) {

        await refetchDashboard()
        toast.success("Alert Raised Successfully");
        onClose();
      }
    } catch (error) {
      console.error("Error raising alert:", error);
    }
  }

  useEffect(() => {
    const error = createCodeAlertError;
    if (error) {
      toast.error(error);
    }
  }, [createCodeAlertError])



  return (
    <div className="modal-overlay">
      <div className="profile-annoucement-card">

        <button className="close-btn" onClick={onClose}>
          &times;
        </button>

        <h2> <CampaignIcon sx={{ fontSize: 25 }} /> Code Announcement</h2>

        <div className="code-list">
          {data?.codeAlerts.length === 0 && (
            <div
              className="code-card"
              style={{ borderLeft: `6px solid black` }}
            >
              No  Code Alerts Are Found
            </div>
          )}
          {data?.codeAlerts?.length && data?.codeAlerts?.length > 0 && data?.codeAlerts?.map((code) => (
            <div
              key={code.name}
              className="code-card"
              style={{ borderLeft: `6px solid ${code.color}` }}
            >
              <div>
                <h3>{code.name}{" "}({code?.shortCode})</h3>
                <p>{code.description}</p>
              </div>

              <Button
                variant="contained"
                size="small"
                style={{ background: code.color }}
                onClick={() => setSelectedCode(code)}
              >
                Raise
              </Button>
            </div>
          ))}

        </div>

        {selectedCode && (
          <div
            className="raise-form"
            style={{
              position: "relative",
              overflow: "visible",
              zIndex: 99999,
            }}
          >
            <h3 style={{ color: selectedCode.color }}>
              Raise Alert : {selectedCode.name}
            </h3>

            {/* Department */}
            <TextField
              select
              fullWidth
              label="Department"
              margin="normal"
              value={form.department}
              onChange={(e) =>
                handleChange("department", e.target.value)
              }
              SelectProps={{
                MenuProps: {
                  disableScrollLock: true,
                  PaperProps: {
                    sx: {
                      zIndex: 999999,
                      maxHeight: 250,
                    },
                  },
                },
              }}
            >
              {data?.departments?.map((d) => (
                <MenuItem key={d?._id} value={d?._id}>
                  {d?.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Doctor */}
            <TextField
              select
              fullWidth
              label="Doctor"
              margin="normal"
              value={form.doctor}
              onChange={(e) =>
                handleChange("doctor", e.target.value)
              }
              SelectProps={{
                MenuProps: {
                  disableScrollLock: true,
                  PaperProps: {
                    sx: {
                      zIndex: 999999,
                      maxHeight: 250,
                    },
                  },
                },
              }}
            >
              {data?.doctors?.map((d) => (
                <MenuItem key={d?._id} value={d?._id}>
                  {d?.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Floor */}
            <TextField
              select
              fullWidth
              label="Floor"
              margin="normal"
              value={form.floor}
              onChange={(e) =>
                handleChange("floor", e.target.value)
              }
              SelectProps={{
                MenuProps: {
                  disableScrollLock: true,
                  PaperProps: {
                    sx: {
                      zIndex: 999999,
                      maxHeight: 250,
                    },
                  },
                },
              }}
            >
              {floors.map((f) => (
                <MenuItem key={f} value={f}>
                  {f}
                </MenuItem>
              ))}
            </TextField>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ward / Room Number"
                  margin="normal"
                  type="text"
                  value={form.wardNumber}
                  onChange={(e) =>
                    handleChange("wardNumber", e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bed Number"
                  margin="normal"
                  type="text"
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                  value={form.bedNo}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (/^\d*$/.test(value)) {
                      handleChange("bedNo", value);
                    }
                  }}
                />
              </Grid>
            </Grid>

            <TextField
              multiline
              rows={3}
              fullWidth
              label="Notes"
              margin="normal"
              value={form.notes}
              onChange={(e) =>
                handleChange("notes", e.target.value)
              }
            />

            <div style={{ marginTop: 16 }}>
              <Button
                variant="contained"
                color="error"
                disabled={createCodeAlertLoading}
                onClick={handleRaise}
              >
                {createCodeAlertLoading ? (
                  <CircularProgress size={22} />
                ) : (
                  "Raise Alert"
                )}
              </Button>

              <Button
                disabled={createCodeAlertLoading}
                style={{ marginLeft: 10 }}
                onClick={() => setSelectedCode(null)}
              >
                Back
              </Button>
            </div>
          </div>
        )}

      </div>
      {/* <LogoutModal
        open={isLogoutModalOpen}
        onClose={handleCloseLogoutModal}
        onLogout={handleLogoutConfirm}
      /> */}
    </div>
  );
};
