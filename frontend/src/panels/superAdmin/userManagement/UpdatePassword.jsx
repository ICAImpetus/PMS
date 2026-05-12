import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  useTheme,
  Chip,
  Stack,
  InputAdornment,
  Paper,
  Divider,
  LinearProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Key as KeyIcon,
  Visibility,
  VisibilityOff,
  Security as SecurityIcon,
} from "@mui/icons-material"; // Icons for close and password
import toast, { Toaster } from "react-hot-toast"; // For toast notifications
import { tokens } from "../../../theme";
import { useApi } from "../../../api/useApi";
import { commonRoutes } from "../../../api/apiService";

// UpdatePasswordForm Component
const UpdatePasswordForm = ({ user, onClose }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
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
      notCommon: !['password', 'password123', '12345678', 'qwerty123', 'admin123'].includes(password.toLowerCase()),
      noSequential: !['123456', 'abcdef', 'qwerty', '987654'].some(seq => password.toLowerCase().includes(seq)),
      noUsername: !user?.username || !password.toLowerCase().includes(user.username.toLowerCase())
    };
  };

  const passwordReqs = getPasswordRequirements(newPassword);

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    const reqs = getPasswordRequirements(password);
    const totalChecks = Object.keys(reqs).length;
    const passedChecks = Object.values(reqs).filter(Boolean).length;
    return (passedChecks / totalChecks) * 100;
  };

  const passwordStrength = calculatePasswordStrength(newPassword);
  const getStrengthColor = (strength) => {
    if (strength < 30) return colors.redAccent?.[500] || "#f44336";
    if (strength < 60) return colors.orangeAccent?.[500] || "#ff9800";
    if (strength < 80) return colors.yellowAccent?.[500] || "#ffeb3b";
    return colors.greenAccent?.[500] || "#4caf50";
  };

  const getStrengthText = (strength) => {
    if (strength < 30) return "Weak";
    if (strength < 60) return "Fair";
    if (strength < 80) return "Good";
    return "Strong";
  };

  const { request: updateUserPassword, error, loading } = useApi(commonRoutes.updateUserPassword)
  // Client-side validation function
  const validate = () => {
    const newErrors = {};

    // New Password Validation
    if (!newPassword) {
      newErrors.newPassword = "New password is required.";
    } else {
      // Length validation
      if (newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters long.";
      } else if (newPassword.length > 50) {
        newErrors.newPassword = "Password must not exceed 50 characters.";
      }
      // Character requirements
      else if (!/(?=.*[a-z])/.test(newPassword)) {
        newErrors.newPassword = "Password must contain at least one lowercase letter.";
      } else if (!/(?=.*\d)/.test(newPassword)) {
        newErrors.newPassword = "Password must contain at least one number.";
      } else if (!/(?=.*[@$!%*?&])/.test(newPassword)) {
        newErrors.newPassword = "Password must contain at least one special character (@$!%*?&).";
      } else if (/\s/.test(newPassword)) {
        newErrors.newPassword = "Password cannot contain spaces.";
      }
      // Common password checks
      else if (['password', 'password123', '12345678', 'qwerty123', 'admin123'].includes(newPassword.toLowerCase())) {
        newErrors.newPassword = "Password is too common. Please choose a stronger password.";
      }
      // Sequential character checks
      else if (['123456', 'abcdef', 'qwerty', '987654'].some(seq => newPassword.toLowerCase().includes(seq))) {
        newErrors.newPassword = "Password cannot contain sequential characters.";
      }
      // Username in password check
      else if (user?.username && newPassword.toLowerCase().includes(user.username.toLowerCase())) {
        newErrors.newPassword = "Password cannot contain your username.";
      }
    }

    // Confirm Password Validation
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
      toast.error("Please fix the errors in the form.");
      return;
    }
    try {
      const response = await updateUserPassword(user.username, newPassword)
      if (response.success) {
        alert("Password updated successfully" || response.message);
        onClose(); // Close the modal on success  
      } else {
        alert("Error in updatePassword ! Please Try Again Later.");
      }
    } catch (error) {
      console.error("Password update failed:", error);
      toast.error("Failed to update password. Please try again.");
    }
  };

  return (
    <Paper
      elevation={24}
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: { xs: 350, sm: 450, md: 600 },
        mx: "auto",
        borderRadius: 3,
        overflow: "hidden",
        background: `linear-gradient(135deg, ${colors.primary?.[800] || "#1e1e2e"} 0%, ${colors.primary?.[900] || "#181825"} 100%)`,
        border: `1px solid ${colors.primary?.[700] || "#313244"}`,
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${colors.blueAccent?.[700] || "#74c0fc"} 0%, ${colors.blueAccent?.[800] || "#339af0"} 100%)`,
          px: 3,
          py: 2.5,
          position: "relative",
        }}
      >
        {/* Close button */}
        <IconButton
          onClick={onClose}
          aria-label="close"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "white",
            backgroundColor: "rgba(255,255,255,0.1)",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.2)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <SecurityIcon sx={{ color: "white", fontSize: 28 }} />
          <Box>
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: "bold",
                color: "white",
                mb: 0.5,
              }}
            >
              Update Password
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.8)",
                fontSize: "0.875rem",
              }}
            >
              for {user?.username || user?.name || "User"}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Form Content */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >

        {/* New Password Field */}
        <Box>
          <TextField
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={!!errors.newPassword}
            helperText={errors.newPassword}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: colors.primary?.[800] || "#1e1e2e",
                "& fieldset": {
                  borderColor: colors.primary?.[600] || "#45475a",
                },
                "&:hover fieldset": {
                  borderColor: colors.blueAccent?.[500] || "#74c0fc",
                },
                "&.Mui-focused fieldset": {
                  borderColor: colors.blueAccent?.[400] || "#91a7ff",
                },
              },
              "& .MuiInputLabel-root": {
                color: colors.grey?.[100] || "#f8f9fa",
              },
              "& .MuiInputBase-input": {
                color: colors.grey?.[100] || "#f8f9fa",
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                    sx={{
                      color: colors.grey?.[400] || "#adb5bd",
                      "&:hover": { color: colors.grey?.[100] || "#f8f9fa" }
                    }}
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Password Strength Indicator */}
          {newPassword && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="body2" sx={{ color: colors.grey?.[300] || "#dee2e6" }}>
                  Password Strength
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: getStrengthColor(passwordStrength),
                    fontWeight: "medium"
                  }}
                >
                  {getStrengthText(passwordStrength)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={passwordStrength}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: colors.primary?.[700] || "#313244",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: getStrengthColor(passwordStrength),
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          )}
        </Box>

        {/* Password Requirements Indicator */}
        {/* {newPassword && (
          <Paper
            elevation={2}
            sx={{
              p: 2,
              backgroundColor: colors.primary?.[950] || "#313244",
              border: `1px solid ${colors.primary?.[600] || "#45475a"}`,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                mb: 1.5,
                color: colors.grey?.[100] || "#f8f9fa",
                fontWeight: "medium",
                display: "flex",
                alignItems: "center",
                gap: 1
              }}
            >
              <SecurityIcon fontSize="small" />
              Password Requirements
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label="8+ characters"
                size="small"
                color={passwordReqs.length ? "success" : "default"}
                variant={passwordReqs.length ? "filled" : "outlined"}
                sx={{
                  "& .MuiChip-label": {
                    fontSize: "0.75rem",
                    fontWeight: "medium"
                  }
                }}
              />
              <Chip
                label="Lowercase"
                size="small"
                color={passwordReqs.lowercase ? "success" : "default"}
                variant={passwordReqs.lowercase ? "filled" : "outlined"}
                sx={{
                  "& .MuiChip-label": {
                    fontSize: "0.75rem",
                    fontWeight: "medium"
                  }
                }}
              />
              <Chip
                label="Uppercase"
                size="small"
                color={passwordReqs.uppercase ? "success" : "default"}
                variant={passwordReqs.uppercase ? "filled" : "outlined"}
                sx={{
                  "& .MuiChip-label": {
                    fontSize: "0.75rem",
                    fontWeight: "medium"
                  }
                }}
              />
              <Chip
                label="Number"
                size="small"
                color={passwordReqs.number ? "success" : "default"}
                variant={passwordReqs.number ? "filled" : "outlined"}
                sx={{
                  "& .MuiChip-label": {
                    fontSize: "0.75rem",
                    fontWeight: "medium"
                  }
                }}
              />
              <Chip
                label="Special char"
                size="small"
                color={passwordReqs.special ? "success" : "default"}
                variant={passwordReqs.special ? "filled" : "outlined"}
                sx={{
                  "& .MuiChip-label": {
                    fontSize: "0.75rem",
                    fontWeight: "medium"
                  }
                }}
              />
              <Chip
                label="No spaces"
                size="small"
                color={passwordReqs.noSpaces ? "success" : "default"}
                variant={passwordReqs.noSpaces ? "filled" : "outlined"}
                sx={{
                  "& .MuiChip-label": {
                    fontSize: "0.75rem",
                    fontWeight: "medium"
                  }
                }}
              />
            </Stack>
          </Paper>
        )} */}

        {/* Confirm Password Field */}
        <TextField
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          variant="outlined"
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: colors.primary?.[800] || "#1e1e2e",
              "& fieldset": {
                borderColor: colors.primary?.[600] || "#45475a",
              },
              "&:hover fieldset": {
                borderColor: colors.blueAccent?.[500] || "#74c0fc",
              },
              "&.Mui-focused fieldset": {
                borderColor: colors.blueAccent?.[400] || "#91a7ff",
              },
            },
            "& .MuiInputLabel-root": {
              color: colors.grey?.[100] || "#f8f9fa",
            },
            "& .MuiInputBase-input": {
              color: colors.grey?.[100] || "#f8f9fa",
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  sx={{
                    color: colors.grey?.[400] || "#adb5bd",
                    "&:hover": { color: colors.grey?.[100] || "#f8f9fa" }
                  }}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Divider sx={{ my: 2, borderColor: colors.primary?.[600] || "#45475a" }} />

        {/* Action Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={{
              borderColor: colors.grey?.[500] || "#6c757d",
              color: colors.grey?.[100] || "#dee2e6",
              "&:hover": {
                borderColor: colors.grey?.[400] || "#adb5bd",
                backgroundColor: "rgba(255,255,255,0.05)",
              },
              minWidth: 100,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{
              background: `linear-gradient(135deg, ${colors.greenAccent?.[600] || "#51cf66"} 0%, ${colors.greenAccent?.[700] || "#40c057"} 100%)`,
              color: "white",
              fontWeight: "medium",
              minWidth: 140,
              "&:hover": {
                background: `linear-gradient(135deg, ${colors.greenAccent?.[700] || "#40c057"} 0%, ${colors.greenAccent?.[800] || "#37b24d"} 100%)`,
              },
              "&:disabled": {
                background: colors.grey?.[600] || "#6c757d",
                color: colors.grey?.[400] || "#adb5bd",
              },
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
