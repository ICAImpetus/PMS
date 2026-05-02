import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  TextField,
  InputAdornment,
  Avatar,
  Typography,
  Box,
  useTheme,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import { toast } from "react-hot-toast";
import { tokens } from "../../../../theme";
import { getDataFunc } from "../../../../utils/services";


const AssignAdminModal = ({ open, onClose, onAssign, hospitalName }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Dynamic user data from API
  const [allAdmins, setAllAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAdmins, setSelectedAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch users from API when modal opens
  useEffect(() => {
    if (open) {
      fetchUsers();
      setSelectedAdmins([]);
      setSearchTerm("");
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("Fetching users...");
      const response = await getDataFunc("getAllUsers");
      console.log("API Response:", response);

      if (response.success && response.data) {
        console.log("Raw users data:", response.data);
        // Filter users that can be assigned (exclude patients, etc.)
        const assignableTypes = ["admin", "superManager"];
        const assignableUsers = response.data.filter((user) => {
          console.log("Filtering user:", user.name, user.type);
          return user.type && assignableTypes.includes(user.type.toLowerCase());
        });
        console.log("Filtered users:", assignableUsers);
        setAllAdmins(assignableUsers);

        if (assignableUsers.length === 0) {
          toast.error("No assignable users found");
        }
      } else {
        console.log("API Error:", response);
        toast.error(response.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  // Toggle Selection
  const handleToggle = (admin) => () => {
    const currentIndex = selectedAdmins.findIndex((a) => a.ID === admin.ID);
    const newChecked = [...selectedAdmins];

    if (currentIndex === -1) {
      newChecked.push(admin);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setSelectedAdmins(newChecked);
  };

  const handleSubmit = () => {
    onAssign(selectedAdmins);
    onClose();
  };

  const filteredAdmins = allAdmins.filter(
    (admin) =>
      (admin.name &&
        admin.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (admin.username &&
        admin.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (admin.email &&
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
        },
      }}
    >
      <DialogTitle
        sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}
      >
        <Typography variant="h5" fontWeight="bold">
          Assign Admins
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Assigning to:{" "}
          <Box
            component="span"
            fontWeight="bold"
            color={colors.greenAccent[500]}
          >
            {hospitalName}
          </Box>
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search admins..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Selected Chips Preview */}
        {selectedAdmins.length > 0 && (
          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
            {selectedAdmins.map((admin) => (
              <Chip
                key={admin.ID}
                label={admin.name}
                onDelete={handleToggle(admin)}
                size="small"
                color="primary"
              />
            ))}
          </Box>
        )}

        {/* Admin List */}
        <List
          sx={{
            width: "100%",
            maxHeight: 300,
            overflow: "auto",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
          }}
        >
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <Typography>Loading users...</Typography>
            </Box>
          ) : filteredAdmins.length > 0 ? (
            filteredAdmins.map((admin) => {
              const isChecked = selectedAdmins.some((a) => a.ID === admin.ID);
              return (
                <ListItem key={admin.ID} disablePadding divider>
                  <ListItemButton onClick={handleToggle(admin)} dense>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={isChecked}
                        tabIndex={-1}
                        disableRipple
                        color="secondary"
                      />
                    </ListItemIcon>
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={2}
                      width="100%"
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: colors.blueAccent[500],
                          fontSize: 14,
                        }}
                      >
                        {admin.name[0]}
                      </Avatar>
                      <Box>
                        <ListItemText
                          primary={admin.name}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {admin.role}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItemButton>
                </ListItem>
              );
            })
          ) : (
            <Box textAlign="center" py={4}>
              <Typography color="textSecondary">No admins found</Typography>
            </Box>
          )}
        </List>
      </DialogContent>
      <DialogActions
        sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}
      >
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="secondary"
          disabled={selectedAdmins.length === 0}
          sx={{ px: 4 }}
        >
          Assign ({selectedAdmins.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default AssignAdminModal;
