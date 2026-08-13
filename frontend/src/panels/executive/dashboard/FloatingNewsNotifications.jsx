import React, { useContext, useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import moment from "moment";
import {
  Box,
  Paper,
  Typography,
  IconButton,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import FollowTheSignsRoundedIcon from "@mui/icons-material/FollowTheSignsRounded";

import { useApi } from "../../../api/useApi";
import { commonRoutes } from "../../../api/apiService";
import HospitalContext from "../../../contexts/HospitalContexts";

// ─── helpers ───────────────────────────────────────────────────────────────

/**
 * Returns true if the given date string / Date is today (local time).
 */
const isToday = (dateVal) => {
  if (!dateVal) return false;
  if (typeof dateVal === "object" && !(dateVal instanceof Date)) {
    dateVal = dateVal.date || dateVal.dateTime || dateVal.startDate;
  }
  if (!dateVal) return false;
  const m = moment(dateVal);
  return m.isValid() && m.isSame(moment(), "day");
};

/**
 * Returns true if the given date string / Date was 3 days ago (local time).
 */
const is3DaysAgo = (dateVal) => {
  if (!dateVal) return false;
  if (typeof dateVal === "object" && !(dateVal instanceof Date)) {
    dateVal = dateVal.date || dateVal.dateTime || dateVal.startDate;
  }
  if (!dateVal) return false;
  const m = moment(dateVal);
  return m.isValid() && m.isSame(moment().subtract(3, "days"), "day");
};

/**
 * Formats a Date-like value or slot string into HH:MM AM/PM string.
 */
const fmtTime = (dateVal, slotStr) => {
  if (slotStr) return slotStr;
  if (!dateVal) return "";
  const m = moment(dateVal);
  return m.isValid() ? m.format("hh:mm A") : "";
};

// ─── notification card configs ──────────────────────────────────────────────

const APPOINTMENT_CONFIG = {
  type: "TODAY'S APPOINTMENT",
  color: "#0a4bb6",
  bgColor: "rgba(10, 75, 182, 0.10)",
  icon: <EventAvailableRoundedIcon />,
};

const FOLLOWUP_CONFIG = {
  type: "PENDING FOLLOW-UP",
  color: "#dc2626",
  bgColor: "rgba(220, 38, 38, 0.10)",
  icon: <FollowTheSignsRoundedIcon />,
};

// ─── FETCH INTERVAL (ms) ────────────────────────────────────────────────────
const FETCH_INTERVAL_MS = 60 * 1000; // re-fetch every 1 min

// ─── display timings ────────────────────────────────────────────────────────
const DISPLAY_INTERVAL_MS = 2200;   // gap between each popup
const DISPLAY_DURATION_MS  = 6500;  // how long each popup stays visible
const MAX_VISIBLE           = 4;

// ────────────────────────────────────────────────────────────────────────────

const FloatingNewsNotifications = ({
  interval   = DISPLAY_INTERVAL_MS,
  duration   = DISPLAY_DURATION_MS,
  maxVisible = MAX_VISIBLE,
}) => {
  const { selectedHostpital, selectedBranch, analytics } = useContext(HospitalContext);

  const { request: getFilledForms } = useApi(commonRoutes.getFilledForms);

  // All built notification objects
  const [allNotifications, setAllNotifications] = useState([]);

  // Currently shown queue
  const [queue, setQueue] = useState([]);

  const nextIndexRef    = useRef(0);
  const removeTimersRef = useRef([]);

  // ── fetch & build notifications ──────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    let rawForms = [];

    // 1. Attempt API fetch with broad parameters so no forms are filtered out by backend query mismatches
    if (selectedHostpital || selectedBranch) {
      try {
        const res = await getFilledForms(
          1,
          selectedHostpital || null,
          selectedBranch || null,
          null, // null date to avoid ISO string format filtering mismatch
          null,
          "",   // searchName
          "All",// purpose
          null, // formsModalOpen
          "all",// formsTypeFilter
          false // isExport
        );

        if (Array.isArray(res?.data)) {
          rawForms = res.data;
        } else if (Array.isArray(res?.forms)) {
          rawForms = res.forms;
        } else if (Array.isArray(res)) {
          rawForms = res;
        } else if (Array.isArray(res?.data?.data)) {
          rawForms = res.data.data;
        }
      } catch (err) {
        console.error("FloatingNewsNotifications fetch error:", err);
      }
    }

    const notifications = [];
    const seenKeys = new Set();

    const pushNotification = (config, message, key) => {
      if (seenKeys.has(key)) return;
      seenKeys.add(key);
      notifications.push({
        ...config,
        message,
      });
    };

    // 2. Process filled forms from API
    rawForms.forEach((form) => {
      const purpose = String(
        form?.purpose ||
        form?.formData?.purpose ||
        form?.POC ||
        form?.formType ||
        ""
      ).toLowerCase();

      const isAppointmentForm =
        purpose.includes("appointment") ||
        purpose === "" ||
        Boolean(form?.appointmentSlot || form?.formData?.appointmentSlot);

      const rawDate =
        form?.dateTime ||
        form?.formData?.dateTime ||
        form?.appointmentSlot?.date ||
        form?.formData?.appointmentSlot?.date ||
        form?.createdAt;

      const followupSt = String(
        form?.followupStatus ||
        form?.formData?.followupStatus ||
        ""
      ).toLowerCase();

      const patientName =
        form?.formData?.patientDetails?.patientName ||
        form?.patientName ||
        form?.formData?.patientName ||
        form?.formData?.name ||
        "Patient";

      const doctorName =
        form?.doctor?.name ||
        form?.doctorName ||
        form?.formData?.doctorName ||
        (typeof form?.doctor === "string" ? form.doctor : "");

      const department =
        form?.department?.name ||
        form?.departmentName ||
        form?.formData?.department ||
        (typeof form?.department === "string" ? form.department : "");

      const slotStr =
        form?.appointmentSlot?.start && form?.appointmentSlot?.end
          ? `${form.appointmentSlot.start} - ${form.appointmentSlot.end}`
          : form?.formData?.appointmentSlot?.start && form?.formData?.appointmentSlot?.end
          ? `${form.formData.appointmentSlot.start} - ${form.formData.appointmentSlot.end}`
          : "";

      const timeStr = fmtTime(rawDate, slotStr);

      // Rule 1: Today's Appointment
      if (isAppointmentForm && isToday(rawDate)) {
        pushNotification(
          APPOINTMENT_CONFIG,
          `${patientName}${doctorName ? ` → Dr. ${doctorName}` : ""}${timeStr ? ` at ${timeStr}` : ""}`,
          `apt-${patientName}-${rawDate}`
        );
      }

      // Rule 2: Today's Follow-up (Appointment was 3 days ago & followup is pending)
      if (isAppointmentForm && is3DaysAgo(rawDate) && followupSt === "pending") {
        pushNotification(
          FOLLOWUP_CONFIG,
          `Follow-up due for ${patientName}${department ? ` (${department})` : ""}`,
          `fol-${patientName}-${rawDate}`
        );
      }
    });

    // 3. Supplementary check from HospitalContext analytics.latestAppointment
    if (Array.isArray(analytics?.latestAppointment)) {
      analytics.latestAppointment.forEach((apt) => {
        const rawDate = apt?.dateTime || apt?.appointmentSlot?.date || apt?.createdAt;
        const patientName = apt?.patientName || apt?.patientDetails?.patientName || "Patient";
        const doctorName = apt?.doctorName || apt?.doctor?.name || "";
        const slotStr = apt?.appointmentSlot
          ? `${apt.appointmentSlot.start} - ${apt.appointmentSlot.end}`
          : "";
        const timeStr = fmtTime(rawDate, slotStr);

        if (isToday(rawDate)) {
          pushNotification(
            APPOINTMENT_CONFIG,
            `${patientName}${doctorName ? ` → Dr. ${doctorName}` : ""}${timeStr ? ` at ${timeStr}` : ""}`,
            `apt-${patientName}-${rawDate}`
          );
        }
      });
    }

    setAllNotifications(notifications);
    nextIndexRef.current = 0;
  }, [selectedHostpital, selectedBranch, analytics, getFilledForms]);

  // Initial fetch + periodic re-fetch
  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, FETCH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // ── cycle through notifications and show them one-by-one ─────────────────
  useEffect(() => {
    if (!allNotifications || allNotifications.length === 0) return;

    const addNotification = () => {
      const source =
        allNotifications[nextIndexRef.current % allNotifications.length];
      nextIndexRef.current += 1;

      const newNotification = {
        ...source,
        id: `${Date.now()}-${nextIndexRef.current}`,
      };

      setQueue((prev) => {
        const updated = [...prev, newNotification];
        return updated.slice(-maxVisible);
      });

      const timer = setTimeout(() => {
        setQueue((prev) =>
          prev.filter((item) => item.id !== newNotification.id)
        );
      }, duration);

      removeTimersRef.current.push(timer);
    };

    // Show first notification immediately
    addNotification();

    const intervalId = setInterval(addNotification, interval);

    return () => {
      clearInterval(intervalId);
      removeTimersRef.current.forEach(clearTimeout);
      removeTimersRef.current = [];
    };
  }, [allNotifications, interval, duration, maxVisible]);

  const handleClose = (id) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  // Nothing to show
  if (typeof document === "undefined" || queue.length === 0) return null;

  return createPortal(
    <>
      {/* Keyframes */}
      <style>
        {`
          @keyframes floatingNewsNotification {
            0% {
              bottom: -120px;
              opacity: 0;
              transform: translateY(30px) scale(0.96);
            }
            10% {
              opacity: 1;
            }
            20% {
              opacity: 1;
            }
            70% {
              bottom: 40vh;
              opacity: 1;
              transform: translateY(0) scale(1);
            }
            88% {
              opacity: 1;
            }
            100% {
              bottom: 45vh;
              opacity: 0;
              transform: translateY(-20px) scale(0.90);
            }
          }
        `}
      </style>

      {/* Overlay */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {queue.map((item, index) => (
          <Paper
            key={item.id}
            elevation={10}
            sx={{
              position: "fixed",
              right: 24,
              bottom: -120,
              width: {
                xs: "calc(100vw - 32px)",
                sm: "420px",
              },
              maxWidth: 440,
              p: {
                xs: 1.3,
                sm: 1.6,
              },
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              gap: 1.4,
              backgroundColor: "#ffffff",
              border: "1px solid rgba(15,23,42,0.08)",
              boxShadow: "0 18px 45px rgba(15,23,42,0.18)",
              overflow: "hidden",
              pointerEvents: "auto",
              animation: `floatingNewsNotification ${duration}ms linear forwards`,
              zIndex: 99999 + index,
            }}
          >
            {/* Left Icon */}
            <Box
              sx={{
                width: {
                  xs: 40,
                  sm: 46,
                },
                height: {
                  xs: 40,
                  sm: 46,
                },
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: item.color || "#2563eb",
                backgroundColor: item.bgColor || "rgba(37,99,235,0.10)",
                "& svg": {
                  fontSize: {
                    xs: 21,
                    sm: 24,
                  },
                },
              }}
            >
              {item.icon}
            </Box>

            {/* Content */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: {
                    xs: 10,
                    sm: 11,
                  },
                  fontWeight: 800,
                  letterSpacing: 1,
                  color: item.color || "#2563eb",
                  lineHeight: 1.2,
                }}
              >
                {item.type}
              </Typography>

              <Typography
                sx={{
                  mt: 0.35,
                  fontSize: {
                    xs: 13,
                    sm: 15,
                  },
                  lineHeight: 1.35,
                  fontWeight: 700,
                  color: "#172033",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: {
                    xs: "normal",
                    sm: "nowrap",
                  },
                }}
              >
                {item.message}
              </Typography>

              <Typography
                sx={{
                  mt: 0.25,
                  fontSize: {
                    xs: 10,
                    sm: 11,
                  },
                  color: "#6b7280",
                }}
              >
                {moment().format("hh:mm A")}
              </Typography>
            </Box>

            {/* Close Button */}
            <IconButton
              size="small"
              onClick={() => handleClose(item.id)}
              sx={{
                flexShrink: 0,
                color: "#737373",
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.05)",
                },
              }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Paper>
        ))}
      </Box>
    </>,
    document.body
  );
};

export default FloatingNewsNotifications;