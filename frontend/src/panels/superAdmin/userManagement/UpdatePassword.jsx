import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Paper,
  Divider,
  LinearProgress,
  Chip,
  Stack,
} from "@mui/material";
import {
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
  Security as SecurityIcon,
  LockOutlined as LockOutlinedIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useApi } from "../../../api/useApi";
import { commonRoutes } from "../../../api/apiService";

const UpdatePasswordForm = ({ user, onClose }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password requirements checker
  const getPasswordRequirements = (password) => {
    return {
      length: password.length >= 8,
      lowercase: /(?=.*[a-z])/.test(password),
      uppercase: /(?=.*[A-Z])/.test(password),
      number: /(?=.*\d)/.test(password),
      special: /(?=.*[@$!%*?&])/.test(password),
      noSpaces: !/\s/.test(password),
    };
  };

  const passwordReqs = getPasswordRequirements(newPassword);

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    const reqs = getPasswordRequirements(password);
    const totalChecks = Object.keys(reqs).length;
    const passedChecks = Object.values(reqs).filter(Boolean).length;
    return (passedChecks / totalChecks) * 100;
  };

  const passwordStrength = calculatePasswordStrength(newPassword);

  const getStrengthColor = (strength) => {
    if (strength < 40) return "#EF4444";
    if (strength < 75) return "#F59E0B";
    return "#10B981";
  };

  const getStrengthText = (strength) => {
    if (strength === 0) return "";
    if (strength < 40) return "Weak";
    if (strength < 75) return "Moderate";
    return "Strong";
  };

  const { request: updateUserPassword, loading } = useApi(
    commonRoutes.updateUserPassword
  );

  // Client-side validation function
  const validate = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = "New password is required.";
    } else {
      if (newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters long.";
      } else if (newPassword.length > 50) {
        newErrors.newPassword = "Password must not exceed 50 characters.";
      } else if (!/(?=.*[a-z])/.test(newPassword)) {
        newErrors.newPassword = "Must contain at least one lowercase letter.";
      } else if (!/(?=.*\d)/.test(newPassword)) {
        newErrors.newPassword = "Must contain at least one number.";
      } else if (!/(?=.*[@$!%*?&])/.test(newPassword)) {
        newErrors.newPassword =
          "Must contain at least one special character (@$!%*?&).";
      } else if (/\s/.test(newPassword)) {
        newErrors.newPassword = "Password cannot contain spaces.";
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required.";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the validation errors.");
      return;
    }
    try {
      const response = await updateUserPassword(user.username, newPassword);
      if (response?.success) {
        toast.success("Password updated successfully");
        onClose();
      } else {
        toast.error(response?.message || "Failed to update password.");
      }
    } catch (error) {
      console.error("Password update failed:", error);
      toast.error("Failed to update password. Please try again.");
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: 480,
        mx: "auto",
        borderRadius: "20px",
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0px 20px 25px -5px rgba(0, 0, 0, 0.08)",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          px: 3.5,
          pt: 3.5,
          pb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box display="flex" gap={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "14px",
              bgcolor: "#EFF6FF",
              color: "#0256E8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LockOutlinedIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} color="#0F172A">
              Update Password
            </Typography>

            <Chip
              label={`USER: @${user?.username || user?.name || "User"}`}
              size="small"
              sx={{
                bgcolor: "#F1F5F9",
                color: "#475569",
                fontWeight: 700,
                fontSize: "10px",
                height: "20px",
                mt: 0.5,
              }}
            />
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "#94A3B8",
            bgcolor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            "&:hover": { bgcolor: "#EFF6FF", color: "#0256E8" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: "#F1F5F9" }} />

      {/* Form Content */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 3.5,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        {/* New Password Field */}
        <Box>
          <TextField
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            size="small"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={!!errors.newPassword}
            helperText={errors.newPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                    size="small"
                    sx={{ color: "#94A3B8" }}
                  >
                    {showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "14px",
                backgroundColor: "#F8FAFC",
                fontSize: "13px",
                "& fieldset": { borderColor: "#E2E8F0" },
                "&:hover fieldset": { borderColor: "#CBD5E1" },
                "&.Mui-focused fieldset": { borderColor: "#0256E8" },
              },
              "& .MuiInputLabel-root": {
                fontSize: "13px",
                color: "#64748B",
              },
            }}
          />

          {/* Password Strength Indicator */}
          {newPassword && (
            <Box sx={{ mt: 1.5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 0.5,
                }}
              >
                <Typography variant="caption" fontWeight={700} color="#64748B">
                  PASSWORD STRENGTH
                </Typography>
                <Typography
                  variant="caption"
                  fontWeight={800}
                  sx={{ color: getStrengthColor(passwordStrength) }}
                >
                  {getStrengthText(passwordStrength)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={passwordStrength}
                sx={{
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: "#E2E8F0",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: getStrengthColor(passwordStrength),
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          )}
        </Box>

        {/* Password Requirements Indicator Pills */}
        {newPassword && (
          <Box
            sx={{
              p: 2,
              bgcolor: "#F8FAFC",
              borderRadius: "14px",
              border: "1px solid #E2E8F0",
            }}
          >
            <Typography
              variant="caption"
              fontWeight={800}
              color="#475569"
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}
            >
              <SecurityIcon sx={{ fontSize: 14 }} /> Security Rules
            </Typography>
            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap gap={0.8}>
              {[
                { label: "8+ Chars", pass: passwordReqs.length },
                { label: "Lowercase", pass: passwordReqs.lowercase },
                { label: "Uppercase", pass: passwordReqs.uppercase },
                { label: "Number", pass: passwordReqs.number },
                { label: "Special Symbol", pass: passwordReqs.special },
              ].map((rule, idx) => (
                <Chip
                  key={idx}
                  label={rule.label}
                  size="small"
                  sx={{
                    bgcolor: rule.pass ? "#ECFDF5" : "#FFFFFF",
                    color: rule.pass ? "#059669" : "#94A3B8",
                    border: rule.pass ? "1px solid #A7F3D0" : "1px solid #E2E8F0",
                    fontWeight: 700,
                    fontSize: "10px",
                    height: "22px",
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Confirm Password Field */}
        <TextField
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          variant="outlined"
          fullWidth
          size="small"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  size="small"
                  sx={{ color: "#94A3B8" }}
                >
                  {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "14px",
              backgroundColor: "#F8FAFC",
              fontSize: "13px",
              "& fieldset": { borderColor: "#E2E8F0" },
              "&:hover fieldset": { borderColor: "#CBD5E1" },
              "&.Mui-focused fieldset": { borderColor: "#0256E8" },
            },
            "& .MuiInputLabel-root": {
              fontSize: "13px",
              color: "#64748B",
            },
          }}
        />

        {/* Action Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pt: 1 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={{
              borderRadius: "12px",
              borderColor: "#CBD5E1",
              color: "#475569",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "12px",
              px: 2.5,
              "&:hover": { borderColor: "#94A3B8", bgcolor: "#F8FAFC" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{
              bgcolor: "#0256E8",
              color: "#FFFFFF",
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 800,
              fontSize: "12px",
              px: 3,
              boxShadow: "none",
              "&:hover": { bgcolor: "#0143B8", boxShadow: "none" },
            }}
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default UpdatePasswordForm;