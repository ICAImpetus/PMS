import React, { useState, useEffect } from "react";
import {
    Box,
    IconButton,
    Badge,
    Paper,
    Typography,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    Divider,
    Button,
    useTheme,
} from "@mui/material";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ClearIcon from "@mui/icons-material/Clear";
import { tokens } from "../theme";
import { commonRoutes } from "../api/apiService";

const NotificationCenter = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [open, setOpen] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        try {
            const response = await commonRoutes.getNotifications();
            if (response.data.success) {
                setNotifications(response.data.data.map(notif => ({
                    id: notif._id,
                    title: notif.title,
                    message: notif.message,
                    timestamp: new Date(notif.createdAt),
                    read: notif.isRead,
                    type: notif.type
                })));
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Optional: refresh every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const handleNotificationClick = (event) => {
        setAnchorEl(event.currentTarget);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setAnchorEl(null);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleMarkAsRead = async (notificationId) => {
        // Individual mark as read could be added to backend, 
        // but for now, we follow the "Clear Unread" logic which marks all.
        // If we want to mark just one, we'd need another endpoint.
        // For simplicity and matching user's "Clear Unread" request, 
        // we'll update local state or call markAll if appropriate.
        setNotifications((prev) =>
            prev.map((notif) =>
                notif.id === notificationId ? { ...notif, read: true } : notif
            )
        );
    };

    const handleClearAll = async () => {
        try {
            if (tabValue === 0) {
                // Clear unread - mark all as read in backend
                await commonRoutes.markNotificationsRead();
                setNotifications((prev) =>
                    prev.map((notif) => ({ ...notif, read: true }))
                );
            } else {
                // Clear read - remove from backend and list
                await commonRoutes.clearNotifications();
                setNotifications((prev) => prev.filter((notif) => notif.read === false));
            }
            fetchNotifications(); // Refresh to be safe
        } catch (error) {
            console.error("Error clearing notifications:", error);
        }
    };

    const filteredNotifications =
        tabValue === 0
            ? notifications.filter((n) => !n.read)
            : notifications.filter((n) => n.read);

    const getTimeAgo = (timestamp) => {
        const seconds = Math.floor((new Date() - timestamp) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <>
            {/* Notification Icon Button */}
            <IconButton
                onClick={handleNotificationClick}
                sx={{
                    color: "white",
                    "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.1)",
                    },
                }}
            >
                <Badge badgeContent={unreadCount} color="error">
                    {unreadCount > 0 ? (
                        <NotificationsIcon />
                    ) : (
                        <NotificationsOutlinedIcon />
                    )}
                </Badge>
            </IconButton>

            {/* Notification Dropdown Box */}
            {open && (
                <Paper
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                        position: "fixed",
                        top: "70px",
                        right: "20px",
                        width: "400px",
                        maxHeight: "500px",
                        zIndex: 1300,
                        borderRadius: "8px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: "white",
                        border: `1px solid lightgrey`,
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "12px 16px",
                            borderBottom: `1px solid ${colors.primary[400]}`,
                            backgroundColor: "white",
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: "600",
                                color: theme.palette.mode === "dark" ? "white" : "#333",
                            }}
                        >
                            Notifications
                        </Typography>
                        <IconButton size="small" onClick={handleClose}>
                            <ClearIcon
                                sx={{
                                    fontSize: "20px",
                                    color: theme.palette.mode === "dark" ? "white" : "#333",
                                }}
                            />
                        </IconButton>
                    </Box>

                    {/* Tabs */}
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        sx={{
                            borderBottom: `1px solid ${colors.primary[400]}`,
                            backgroundColor: "white",
                            "& .MuiTab-root": {
                                color: theme.palette.mode === "dark" ? "#aaa" : "#666",
                                fontSize: "14px",
                                fontWeight: "500",
                            },
                            "& .Mui-selected": {
                                color: theme.palette.mode === "dark" ? "#fff" : "#1976d2",
                            },
                            "& .MuiTabs-indicator": {
                                backgroundColor: "#1976d2",
                            },
                        }}
                    >
                        <Tab
                            label={`Unread (${notifications.filter((n) => !n.read).length})`}
                        />
                        <Tab
                            label={`Read (${notifications.filter((n) => n.read).length})`}
                        />notifications
                    </Tabs>

                    {/* Notifications List */}
                    <Box
                        sx={{
                            flex: 1,
                            overflowY: "auto",
                            maxHeight: "380px",
                            "&::-webkit-scrollbar": {
                                width: "6px",
                            },
                            "&::-webkit-scrollbar-track": {
                                backgroundColor:
                                    theme.palette.mode === "dark"
                                        ? colors.primary[700]
                                        : colors.primary[200],
                            },
                            "&::-webkit-scrollbar-thumb": {
                                backgroundColor:
                                    theme.palette.mode === "dark"
                                        ? colors.primary[500]
                                        : colors.primary[400],
                                borderRadius: "3px",
                            },
                        }}
                    >
                        {filteredNotifications.length === 0 ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    height: "200px",
                                    color: theme.palette.mode === "dark" ? "#aaa" : "#999",
                                }}
                            >
                                <Typography variant="body2">
                                    No {tabValue === 0 ? "unread" : "read"} notifications
                                </Typography>
                            </Box>
                        ) : (
                            <List sx={{ padding: 0 }}>
                                {filteredNotifications.map((notification, index) => (
                                    <React.Fragment key={notification.id}>
                                        <ListItem
                                            sx={{
                                                backgroundColor: "white",
                                                padding: "12px 16px",
                                                cursor: "pointer",
                                                transition: "background-color 0.2s ease",
                                                "&:hover": {
                                                    backgroundColor:
                                                        theme.palette.mode === "dark"
                                                            ? colors.primary[650]
                                                            : colors.primary[250],
                                                },
                                            }}
                                            onClick={() => {
                                                handleMarkAsRead(notification.id);

                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{
                                                            fontWeight: notification.read ? "400" : "600",
                                                            color:
                                                                theme.palette.mode === "dark"
                                                                    ? "white"
                                                                    : "#333",
                                                        }}
                                                    >
                                                        {notification.title}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box sx={{ marginTop: "4px" }}>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                display: "block",
                                                                color:
                                                                    theme.palette.mode === "dark"
                                                                        ? "#aaa"
                                                                        : "#666",
                                                                marginBottom: "4px",
                                                            }}
                                                        >
                                                            {notification.message}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color:
                                                                    theme.palette.mode === "dark"
                                                                        ? "#888"
                                                                        : "#999",
                                                            }}
                                                        >
                                                            {getTimeAgo(notification.timestamp)}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        {index < filteredNotifications.length - 1 && (
                                            <Divider
                                                sx={{
                                                    borderColor:
                                                        theme.palette.mode === "dark"
                                                            ? colors.primary[500]
                                                            : colors.primary[300],
                                                }}
                                            />
                                        )}
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </Box>

                    {/* Footer Action Button */}
                    {filteredNotifications.length > 0 && (
                        <Box
                            sx={{
                                padding: "8px 16px",
                                borderTop: `1px solid ${colors.primary[400]}`,
                                backgroundColor: "white",
                                textAlign: "center",
                            }}
                        >
                            <Button
                                size="small"
                                onClick={handleClearAll}
                                sx={{
                                    color: "#1976d2",
                                    textTransform: "none",
                                    "&:hover": {
                                        backgroundColor: "rgba(25, 118, 210, 0.1)",
                                    },
                                }}
                            >
                                Clear {tabValue === 0 ? "Unread" : "Read"}
                            </Button>
                        </Box>
                    )}
                </Paper>
            )}

            {/* Overlay to close notification box when clicking outside */}
            {open && (
                <Box
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        zIndex: 1200,
                    }}
                    onClick={handleClose}
                />
            )}
        </>
    );
};

export default NotificationCenter;
