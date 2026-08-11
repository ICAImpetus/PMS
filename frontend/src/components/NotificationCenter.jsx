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
  Chip,
  Button,
} from "@mui/material";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ClearIcon from "@mui/icons-material/Clear";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { commonRoutes } from "../api/apiService";

const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const response = await commonRoutes.getNotifications();
      if (response.data.success) {
        setNotifications(
          response.data.data.map((notif) => ({
            id: notif._id,
            title: notif.title,
            message: notif.message,
            timestamp: new Date(notif.createdAt),
            read: notif.isRead,
            type: notif.type,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (event) => {
    event.stopPropagation();
    setOpen((prev) => !prev);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMarkAsRead = async (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const handleClearAll = async () => {
    try {
      if (tabValue === 0) {
        await commonRoutes.markNotificationsRead();
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, read: true }))
        );
      } else {
        await commonRoutes.clearNotifications();
        setNotifications((prev) => prev.filter((notif) => notif.read === false));
      }
      fetchNotifications();
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
    <Box sx={{ position: "relative", display: "inline-block" }}>
      {/* Bell Icon Trigger */}
      <IconButton
        onClick={handleNotificationClick}
        sx={{
          bgcolor: "#fff",
          border: "1px solid #e2e8f0",
          p: 1,
          color: "#475569",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.65rem",
              fontWeight: 800,
              height: 16,
              minWidth: 16,
              px: 0.5,
              bgcolor: "#dc2626",
            },
          }}
        >
          {unreadCount > 0 ? (
            <NotificationsActiveIcon sx={{ fontSize: 18, color: "#0a4bb6" }} />
          ) : (
            <NotificationsOutlinedIcon sx={{ fontSize: 18, color: "#475569" }} />
          )}
        </Badge>
      </IconButton>

      {/* Modern Popover Dropdown */}
      {open && (
        <Paper
          onClick={(e) => e.stopPropagation()}
          elevation={0}
          sx={{
            position: "fixed",
            top: "75px",
            right: "24px",
            width: { xs: "330px", sm: "390px" },
            maxHeight: "520px",
            zIndex: 9999,
            borderRadius: "24px",
            boxShadow:
              "0 20px 40px rgba(15, 23, 42, 0.14), 0 1px 3px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#ffffff",
            border: "1px solid #edf2f7",
            overflow: "hidden",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justify: "space-between",
              alignItems: "center",
              px: 2.5,
              py: 2,
              borderBottom: "1px solid #f1f5f9",
              backgroundColor: "#ffffff",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 4,
                  height: 18,
                  bgcolor: "#0a4bb6",
                  borderRadius: "2px",
                }}
              />
              <Typography
                variant="h6"
                sx={{ fontWeight: "800", color: "#0f172a", fontSize: "1rem" }}
              >
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Chip
                  label={`${unreadCount} New`}
                  size="small"
                  sx={{
                    bgcolor: "#eff6ff",
                    color: "#0a4bb6",
                    fontWeight: 800,
                    fontSize: "0.68rem",
                    height: 20,
                  }}
                />
              )}
            </Box>
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{
                bgcolor: "#f8fafc",
                color: "#64748b",
                "&:hover": { bgcolor: "#f1f5f9", color: "#0f172a" },
              }}
            >
              <ClearIcon sx={{ fontSize: "16px" }} />
            </IconButton>
          </Box>

          {/* Modern Pill Tabs */}
          <Box
            sx={{
              px: 2.5,
              pt: 1.5,
              pb: 1.5,
              backgroundColor: "#ffffff",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                minHeight: 36,
                "& .MuiTabs-indicator": { display: "none" },
                "& .MuiTab-root": {
                  minHeight: 32,
                  py: 0.5,
                  px: 2,
                  borderRadius: "50px",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  textTransform: "none",
                  color: "#64748b",
                  transition: "all 0.2s ease",
                  mr: 1,
                  bgcolor: "#f8fafc",
                  "&.Mui-selected": {
                    color: "#ffffff",
                    backgroundColor: "#0a4bb6",
                    boxShadow: "0 2px 8px rgba(10, 75, 182, 0.25)",
                  },
                },
              }}
            >
              <Tab
                label={`Unread (${
                  notifications.filter((n) => !n.read).length
                })`}
              />
              <Tab
                label={`Read (${
                  notifications.filter((n) => n.read).length
                })`}
              />
            </Tabs>
          </Box>

          {/* Notifications List */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              maxHeight: "340px",
              p: 1.5,
              "&::-webkit-scrollbar": { width: "5px" },
              "&::-webkit-scrollbar-track": { backgroundColor: "#f1f5f9" },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#cbd5e1",
                borderRadius: "10px",
              },
            }}
          >
            {filteredNotifications.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justify: "center",
                  alignItems: "center",
                  height: "180px",
                  color: "#94a3b8",
                  gap: 1,
                }}
              >
                <CheckCircleOutlineIcon sx={{ fontSize: 36, color: "#cbd5e1" }} />
                <Typography variant="body2" fontWeight={600}>
                  No {tabValue === 0 ? "unread" : "read"} notifications
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0, display: "flex", flexDirection: "column", gap: 1 }}>
                {filteredNotifications.map((notification) => (
                  <ListItem
                    key={notification.id}
                    onClick={() => handleMarkAsRead(notification.id)}
                    sx={{
                      backgroundColor: notification.read ? "#ffffff" : "#f8fafc",
                      border: "1px solid #edf2f7",
                      borderRadius: "16px",
                      padding: "12px 16px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      borderLeft: notification.read
                        ? "1px solid #edf2f7"
                        : "4px solid #0a4bb6",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      "&:hover": {
                        backgroundColor: "#f1f5f9",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justify: "space-between",
                        alignItems: "center",
                        width: "100%",
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: notification.read ? "600" : "800",
                          color: "#0f172a",
                          fontSize: "0.83rem",
                        }}
                      >
                        {notification.title}
                      </Typography>

                      {!notification.read && (
                        <Box
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            bgcolor: "#0a4bb6",
                          }}
                        />
                      )}
                    </Box>

                    <Typography
                      variant="caption"
                      sx={{
                        color: "#475569",
                        fontSize: "0.75rem",
                        lineHeight: 1.4,
                        mb: 1,
                        display: "block",
                      }}
                    >
                      {notification.message}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: "#94a3b8",
                        fontSize: "0.68rem",
                        fontWeight: 600,
                      }}
                    >
                      {getTimeAgo(notification.timestamp)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {/* Action Footer */}
          {filteredNotifications.length > 0 && (
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                borderTop: "1px solid #f1f5f9",
                backgroundColor: "#ffffff",
                display: "flex",
                justify: "space-between",
                alignItems: "center",
              }}
            >
              <Button
                size="small"
                onClick={handleClearAll}
                sx={{
                  color: "#0a4bb6",
                  fontWeight: 800,
                  fontSize: "0.78rem",
                  textTransform: "none",
                  borderRadius: "50px",
                  px: 2,
                  py: 0.6,
                  bgcolor: "#eff6ff",
                  "&:hover": {
                    backgroundColor: "#dbeafe",
                  },
                }}
              >
                Clear {tabValue === 0 ? "Unread" : "Read"}
              </Button>
              <Typography variant="caption" fontWeight={700} color="#94a3b8">
                {filteredNotifications.length} notifications
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Backdrop overlay */}
      {open && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9998,
          }}
          onClick={handleClose}
        />
      )}
    </Box>
  );
};

export default NotificationCenter;
