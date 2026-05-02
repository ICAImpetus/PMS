import "./ProfilePopup.css";
import { useEffect, useState } from "react";
import { TextField, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, IconButton, CircularProgress } from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";

import LogoutIcon from "@mui/icons-material/Logout";
import { commonRoutes } from "../../api/apiService";
import { useApi } from "../../api/useApi";
import toast from "react-hot-toast";
import { UserContextHook } from "../../contexts/UserContexts";
import LogoutModal from "../../components/LogoutModal";

export const ProfilePopup = ({ user, onClose, handleLogout }) => {
  const { currentUser, setCurrentUser } = UserContextHook();
  const userType = currentUser?.type;
  const isSuperAdmin = userType === "superadmin";
  console.log("currentUser", currentUser)


  // State for modals
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);

  // Profile update state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    username: user?.username || "",
    type: user?.type || ""
  });
  const { request: updateUser, loading: updateLoading } = useApi(commonRoutes.updateUser);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const { request: updateUserPassword, loading: passwordLoading } = useApi(commonRoutes.updateUserPassword);

  // Handlers
  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async () => {
    try {
      if (!user?.mongoId) {
        toast.error("User Not Found")
        return
      }
      const res = await updateUser(user?.mongoId, profileForm);
      if (res?.success) {
        localStorage.setItem("current_user", JSON.stringify(res?.data));
        setCurrentUser(res?.data)

        toast.success("Profile updated successfully");
        setOpenProfileModal(false);
      } else {
        toast.error(res?.message || "Failed to update profile");
      }
    } catch (err) {
      console.log("EEro", err);

      toast.error("Error updating profile");
    }
  };

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
      const res = await updateUserPassword(user.username, passwordForm.newPassword);
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

  return (
    <div className="modal-overlay">
      <div className="profile-annoucement-card ">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>

        <div className="profile-header">
          <div className="avatar">{user.name.charAt(0)}</div>
          <h2>User Profile</h2>
        </div>

        <div className="profile-body">
          <div className="info-group">
            <label>Name</label>
            <p>{user?.name}</p>
          </div>
          <div className="info-group">
            <label>Username</label>
            <p>{user?.username}</p>
          </div>
          <div className="info-group">
            <label>Email</label>
            <p>{user?.email}</p>
          </div>
        </div>

        <div className="profile-actions">
          {isSuperAdmin && (
            <>
              <button className="btn-update" onClick={() => setOpenProfileModal(true)}>Update Profile</button>
              <button className="btn-password" onClick={() => setOpenPasswordModal(true)}>
                {user.type === "supermanager" ||
                  user.type === "admin" ||
                  user.type === "superAdmin" ||
                  user.type === "superadmin" ||
                  user.type === "SuperAdmin"
                  ? "Change Password"
                  : "Request Password Change"}
              </button>
            </>
          )}

          <button className="btn-update" style={{ padding: '0 0 0 0', background: '#f44336' }} color="error" onClick={handleLogout}>
            <IconButton>
              <LogoutIcon sx={{ color: "white" }} />
            </IconButton>
            Logout
          </button>
        </div>
      </div>

      {/* Update Profile Modal */}
      <Dialog open={openProfileModal} onClose={() => setOpenProfileModal(false)}>
        <DialogTitle>Update Profile</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            name="name"
            value={profileForm.name}
            onChange={handleProfileChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            value={profileForm.email}
            onChange={handleProfileChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Username"
            name="username"
            value={profileForm.username}
            onChange={handleProfileChange}
            fullWidth
            disabled
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProfileModal(false)} disabled={updateLoading}>Cancel</Button>
          <Button onClick={handleProfileSubmit} disabled={updateLoading} variant="contained" color="primary">
            {updateLoading ? <CircularProgress size={22} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={openPasswordModal} onClose={() => setOpenPasswordModal(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="New Password"
            name="newPassword"
            type="password"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordModal(false)} disabled={passwordLoading}>Cancel</Button>
          <Button onClick={handlePasswordSubmit} disabled={passwordLoading} variant="contained" color="primary">
            {passwordLoading ? <CircularProgress size={22} /> : "Change"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export const CodeAnnousementPopup = ({ hosId, data, onClose, currentUser, setCodeAlerts }) => {

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
        HospitalId: currentUser?.hospital,
        BranchId: currentUser?.branches?.[0],
        depertmentId: form.department,
        doctorId: form.doctor,
        code_id: selectedCode?._id, // Using the _id of the announcement
        floor: form.floor,
        room: form.wardNumber,
        bed: form.bedNo,
        description: form.notes,
      };

      const res = await createCodeAlert(hosId, payload);
      if (res?.success) {
        setCodeAlerts((prev) => [...prev, res?.data])
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

        {!selectedCode && (
          <div className="code-list">
            {data?.codeAlerts?.length === 0 && (
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
        )}

        {selectedCode && (
          <div className="raise-form">

            <h3 style={{ color: `${selectedCode.color}` }}>Raise Alert : {selectedCode.name}</h3>

            <TextField
              select
              fullWidth
              label="Department"
              margin="normal"
              value={form.department}
              onChange={(e) =>
                handleChange("department", e.target.value)
              }
            >
              {data?.departments.map((d) => (
                <MenuItem key={d} value={d?._id}>
                  {d?.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Doctor"
              margin="normal"
              value={form.doctor}
              onChange={(e) =>
                handleChange("doctor", e.target.value)
              }
            >
              {data?.doctors.map((d) => (
                <MenuItem key={d} value={d?._id}>
                  {d?.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Floor"
              margin="normal"
              value={form.floor}
              onChange={(e) =>
                handleChange("floor", e.target.value)
              }
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
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  value={form.bedNo}
                  onChange={(e) => {
                    const value = e.target.value;

                    // only numbers allow
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
                {createCodeAlertLoading ? <CircularProgress size={22} /> : "Raise Alert"}
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
      <LogoutModal
        open={isLogoutModalOpen}
        onClose={handleCloseLogoutModal}
        onLogout={handleLogoutConfirm}
      />
    </div>
  );
};
