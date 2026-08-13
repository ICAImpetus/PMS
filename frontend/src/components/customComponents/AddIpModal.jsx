import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    IconButton,
    Box,
    Typography,
    Divider,
    CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";

const IP_TYPES = [
    { value: "PUBLIC", label: "Public" },
    { value: "PRIVATE", label: "Private" },
    { value: "CIDR", label: "CIDR Range" },
];

// IPv4 / CIDR Regex Validation
const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/([0-9]|[12][0-9]|3[0-2]))?$/;

export default function AddIpModal({ open, onClose, loading, onSubmit, hospitalName }) {
    const [ipList, setIpList] = useState([
        { ip: "", type: "PUBLIC", description: "", error: "" },
    ]);

    // Handle Input Changes
    const handleChange = (index, field, value) => {
        const updated = [...ipList];
        updated[index][field] = value;

        if (field === "ip") {
            updated[index].error =
                value && !ipRegex.test(value) ? "Enter a valid IP address (e.g., 192.168.1.1)" : "";
        }

        setIpList(updated);
    };

    // Add another IP row
    const handleAddRow = () => {
        setIpList([
            ...ipList,
            { ip: "", type: "PUBLIC", description: "", error: "" },
        ]);
    };

    // Remove IP row
    const handleRemoveRow = (index) => {
        if (ipList.length > 1) {
            setIpList(ipList.filter((_, i) => i !== index));
        }
    };

    // Submit Handler
    const handleSubmit = () => {
        let hasError = false;
        const validated = ipList.map((item) => {
            if (!item.ip.trim()) {
                hasError = true;
                return { ...item, error: "IP address is required" };
            }
            if (!ipRegex.test(item.ip.trim())) {
                hasError = true;
                return { ...item, error: "Invalid IP address format" };
            }
            return item;
        });

        if (hasError) {
            setIpList(validated);
            return;
        }

        // Clean payload according to Mongoose schema
        const payload = ipList.map(({ ip, type, description }) => ({
            ip: ip.trim(),
            type,
            description: description.trim(),
        }));

        onSubmit(payload);

    };

    const handleCloseModal = () => {
        setIpList([{ ip: "", type: "PUBLIC", description: "", error: "" }]);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleCloseModal}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "16px",
                    p: 1,
                },
            }}
        >
            {/* Header */}
            <DialogTitle
                sx={{
                    display: "flex",
                    justify: "space-between",
                    alignItems: "center",
                    fontWeight: 700,
                    color: "#0F172A",
                }}
            >
                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        Add Hospital IP Addresses
                    </Typography>
                    {hospitalName && (
                        <Typography variant="caption" color="text.secondary">
                            Hospital: {hospitalName}
                        </Typography>
                    )}
                </Box>
                <IconButton onClick={handleCloseModal} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider />

            {/* Form Content */}
            <DialogContent sx={{ mt: 1 }}>
                {ipList.map((row, index) => (
                    <Box
                        key={index}
                        display="flex"
                        gap={2}
                        alignItems="flex-start"
                        mb={2.5}
                    >
                        {/* IP Address Field */}
                        <TextField
                            label="IP Address"
                            placeholder="e.g. 192.168.1.1"
                            size="small"
                            value={row.ip}
                            onChange={(e) => handleChange(index, "ip", e.target.value)}
                            error={Boolean(row.error)}
                            helperText={row.error}
                            sx={{ flex: 2 }}
                        />

                        {/* Type Dropdown */}
                        <TextField
                            select
                            label="IP Type"
                            size="small"
                            value={row.type}
                            onChange={(e) => handleChange(index, "type", e.target.value)}
                            sx={{ flex: 1 }}
                        >
                            {IP_TYPES.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Description Field */}
                        <TextField
                            label="Description (Optional)"
                            placeholder="e.g. Main Server"
                            size="small"
                            value={row.description}
                            onChange={(e) =>
                                handleChange(index, "description", e.target.value)
                            }
                            sx={{ flex: 2 }}
                        />

                        {/* Remove Row Button */}
                        <IconButton
                            color="error"
                            onClick={() => handleRemoveRow(index)}
                            disabled={ipList.length === 1}
                            sx={{ mt: "2px" }}
                        >
                            <DeleteOutlineIcon />
                        </IconButton>
                    </Box>
                ))}

                {/* Add More IP Button */}
                <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddRow}
                    sx={{
                        color: "#0256E8",
                        fontWeight: 600,
                        textTransform: "none",
                        "&:hover": { backgroundColor: "#F1F5F9" },
                    }}
                >
                    Add Another IP
                </Button>
            </DialogContent>

            <Divider />

            {/* Actions */}
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button
                    onClick={handleCloseModal}
                    disabled={loading}
                    sx={{
                        borderRadius: "20px",
                        color: "#64748B",
                        textTransform: "none",
                        fontWeight: 600,
                        px: 3,
                    }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{
                        borderRadius: "20px",
                        backgroundColor: "#0256E8",
                        color: "#FFFFFF",
                        textTransform: "none",
                        fontWeight: 700,
                        px: 3,
                        py: 1,
                        boxShadow: "0px 2px 4px rgba(2, 86, 232, 0.2)",
                        "&:hover": {
                            backgroundColor: "#0143B8",
                        },
                    }}
                >
                    {loading ? <CircularProgress size={22} /> : "Save IP Addresses"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}