import React, { useEffect, useState, useRef, useMemo, useContext } from "react";
import Chart from "chart.js/auto";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  Avatar,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterListIcon from "@mui/icons-material/FilterList";
import SecurityIcon from "@mui/icons-material/Security";
import StorageIcon from "@mui/icons-material/Storage";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LocationCityIcon from "@mui/icons-material/LocationCity";

import { UserContextHook } from "../../../contexts/UserContexts";
import HospitalContext from "../../../contexts/HospitalContexts";
import { toast } from "react-toastify";
import moment from "moment";
import { ProjectThemeSettings } from "../../../theme";

// Styled Root Container
const RootContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#F8FAFC",
  minHeight: "100vh",
  padding: theme.spacing(3, 4),
  fontFamily: "'Inter', sans-serif",
}));

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "20px",
  border: "1px solid #E2E8F0",
  boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.02)",
  backgroundColor: "#FFFFFF",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
}));

const AuditLogs = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { currentUser } = UserContextHook();

  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState({ auditLogs: "" });
  const [endDate, setEndDate] = useState({ auditLogs: "" });

  const {
    allLogs,
    loading,
    refetchLogs,
    pagination,
    setPagination,
    hospitals,
    selectedHostpital,
    setSelectedHostpital,
  } = useContext(HospitalContext);

  const accountCreationDate = useMemo(() => {
    const createdAt =
      currentUser?.createdAt ||
      currentUser?.created_at ||
      currentUser?.createdOn;
    if (!createdAt) return "";

    const parsed = moment(createdAt);
    return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "";
  }, [currentUser]);

  const handleStartDateChange = (value) => {
    if (!value) {
      return setStartDate((prev) => ({
        ...prev,
        auditLogs: "",
      }));
    }

    const selected = moment(value, "YYYY-MM-DD");
    const created = moment(accountCreationDate, "YYYY-MM-DD");

    if (accountCreationDate && selected.isBefore(created)) {
      toast.error("Start date cannot be before your account creation date");
      return;
    }

    if (endDate?.auditLogs && selected.isAfter(moment(endDate.auditLogs, "YYYY-MM-DD"))) {
      toast.error("Start date cannot be after the end date");
      return;
    }

    setStartDate((prev) => ({
      ...prev,
      auditLogs: value,
    }));
  };

  const handleEndDateChange = (value) => {
    if (
      value &&
      accountCreationDate &&
      moment(value).isBefore(moment(accountCreationDate, "YYYY-MM-DD"))
    ) {
      toast.error("End date cannot be before your account creation date");
      return;
    }
    if (
      value &&
      startDate?.auditLogs &&
      moment(value).isBefore(moment(startDate?.auditLogs, "YYYY-MM-DD"))
    ) {
      toast.error("End date cannot be before the start date");
      return;
    }
    setEndDate((prev) => ({
      ...prev,
      auditLogs: value,
    }));
  };

  // Filtering Logic
  const filteredLogs = useMemo(() => {
    return (
      allLogs?.filter((log) => {
        const actionTarget = `${log.action || ""}`.toLowerCase();
        const detailsTarget = `${log.customMessage || ""}`.toLowerCase();
        const nameTarget = `${log.name || ""}`.toLowerCase();
        const searchTarget = `${nameTarget} ${actionTarget} ${detailsTarget}`;
        const matchesSearch =
          searchTerm === "" || searchTarget.includes(searchTerm.toLowerCase());

        const logDate = moment(log.createdAt || log.timestamp || log.date);
        const matchesStartDate =
          !startDate?.auditLogs ||
          (logDate.isValid() &&
            logDate.isSameOrAfter(moment(startDate?.auditLogs).startOf("day")));
        const matchesEndDate =
          !endDate?.auditLogs ||
          (logDate.isValid() &&
            logDate.isSameOrBefore(moment(endDate?.auditLogs).endOf("day")));

        const matchesFilterType =
          filterType === "all" ||
          (log.module || "").toLowerCase().includes(filterType.toLowerCase()) ||
          (log.role || "").toLowerCase().includes(filterType.toLowerCase());

        return (
          matchesSearch && matchesStartDate && matchesEndDate && matchesFilterType
        );
      }) || []
    );
  }, [allLogs, searchTerm, filterType, startDate, endDate]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const total = allLogs?.length || 0;
    const critical =
      allLogs?.filter(
        (l) =>
          (l.level || "").toLowerCase() === "error" ||
          (l.level || "").toLowerCase() === "critical"
      )?.length || 0;
    const failedLogins =
      allLogs?.filter((l) =>
        (l?.action || "").toLowerCase().includes("failed login")
      )?.length || 0;

    return { total, critical, failedLogins };
  }, [allLogs]);

  // Recent Security Events
  const securityEvents = useMemo(() => {
    return (allLogs || [])
      .filter((l) => {
        const action = (l?.action || "").toLowerCase();
        return (
          action.includes("login") ||
          action.includes("password") ||
          action.includes("security") ||
          l.level === "error"
        );
      })
      .slice(0, 3);
  }, [allLogs]);

  // Chart Logic (Doughnut / Polar Area matching UI)
  useEffect(() => {
    if (chartRef.current && allLogs?.length > 0) {
      if (chartInstance.current) chartInstance.current.destroy();

      const moduleCounts = allLogs.reduce((acc, log) => {
        const mod = log?.module || "Other";
        acc[mod] = (acc[mod] || 0) + 1;
        return acc;
      }, {});

      const ctx = chartRef.current.getContext("2d");
      chartInstance.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: Object.keys(moduleCounts),
          datasets: [
            {
              data: Object.values(moduleCounts),
              backgroundColor: ["#0256E8", "#60A5FA", "#E2E8F0", "#38BDF8", "#818CF8"],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "75%",
          plugins: {
            legend: { display: false },
          },
        },
      });
    }
  }, [allLogs]);

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      toast.error("No logs to export");
      return;
    }

    const headers = [
      "Timestamp",
      "User",
      "Action",
      "Module",
      "Role",
      "IP Address",
      "Details",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map((log) => {
        const m = log || {};
        return [
          `"${moment(log.createdAt || log.timestamp).format("YYYY-MM-DD HH:mm:ss")}"`,
          `"${m.name || "System"}"`,
          `"${m.action || ""}"`,
          `"${m.module || ""}"`,
          `"${m.role || ""}"`,
          `"${m.ip || ""}"`,
          `"${(m.customMessage || "").replace(/"/g, '""')}"`,
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `admin_audit_logs_${moment().format("YYYY-MM-DD")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Logs exported successfully");
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <RootContainer id="audit">
      {/* 1. HEADER SECTION */}
      <Box mb={3}>
        <Typography variant="h3" component="h1" fontWeight={800} color="#0F172A">
          Audit <span style={{ color: "#0256E8" }}>Log</span>
        </Typography>
        <Typography variant="body2" color="#64748B" mt={0.5} fontWeight={500}>
          Comprehensive system-wide tracking of user actions and security events.
        </Typography>
      </Box>

      {/* 2. FILTER & TOOLBAR BAR */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: "20px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          mb: 3,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Hospital Context Dropdown */}
          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth size="small">
              <Select
                value={selectedHostpital || ""}
                onChange={(e) => setSelectedHostpital(e.target.value)}
                displayEmpty
                startAdornment={
                  <InputAdornment position="start">
                    <LocationCityIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
                  </InputAdornment>
                }
                sx={{
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                  bgcolor: "#F8FAFC",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
                }}
              >
                {hospitals?.map((hospital) => (
                  <MenuItem key={hospital._id} value={hospital._id}>
                    {hospital.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Date Range: From */}
          <Grid item xs={12} sm={3} md={2}>
            <TextField
              type="date"
              size="small"
              fullWidth
              value={startDate?.auditLogs || ""}
              inputProps={{
                min: accountCreationDate,
                max: endDate?.auditLogs || undefined,
              }}
              onChange={(e) => handleStartDateChange(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "20px",
                  bgcolor: "#F8FAFC",
                  fontSize: "12px",
                },
              }}
            />
          </Grid>

          {/* Date Range: To */}
          <Grid item xs={12} sm={3} md={2}>
            <TextField
              type="date"
              size="small"
              fullWidth
              value={endDate?.auditLogs || ""}
              inputProps={{
                min: startDate?.auditLogs || accountCreationDate || undefined,
                max: today,
              }}
              onChange={(e) => handleEndDateChange(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "20px",
                  bgcolor: "#F8FAFC",
                  fontSize: "12px",
                },
              }}
            />
          </Grid>

          {/* Search Box */}
          <Grid item xs={12} sm={6} md={3.5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Filter by name, email or IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "20px",
                  bgcolor: "#F8FAFC",
                  fontSize: "12px",
                },
              }}
            />
          </Grid>

          {/* Actions: Export & Refresh */}
          <Grid item xs={12} sm={6} md={2} display="flex" gap={1}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              sx={{
                bgcolor: ProjectThemeSettings.titleTextColor.light,
                // color: "white",
                borderRadius: "20px",
                textTransform: "uppercase",
                fontWeight: 800,
                fontSize: "11px",
                py: 1,
                boxShadow: "none",
                "&:hover": { bgcolor: ProjectThemeSettings.titleTextColor.lighter, boxShadow: "none" },
              }}
            >
              EXPORT CSV
            </Button>
            <IconButton
              onClick={refetchLogs}
              sx={{ bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}
            >
              <RefreshIcon fontSize="small" sx={{ color: "#64748B" }} />
            </IconButton>
          </Grid>
        </Grid>
      </Paper>

      {/* 3. LOGS DATA TABLE CARD */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "20px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
          mb: 4,
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={3}
          borderBottom="1px solid #F1F5F9"
        >
          <Typography variant="h6" fontWeight={800} color="#0F172A">
            Recent Records
          </Typography>

          <Chip
            label={`${filteredLogs.length} Records Found`}
            size="small"
            sx={{
              bgcolor: "#EFF6FF",
              color: "#0256E8",
              fontWeight: 800,
              fontSize: "10px",
              borderRadius: "12px",
            }}
          />
        </Box>

        {loading?.auditLogLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="300px">
            <CircularProgress sx={{ color: "#0256E8" }} />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#FFFFFF" }}>
                <TableRow>
                  <TableCell sx={{ fontSize: "10px", fontWeight: 800, color: "#64748B" }}>
                    TIMESTAMP
                  </TableCell>
                  <TableCell sx={{ fontSize: "10px", fontWeight: 800, color: "#64748B" }}>
                    USER / ACCOUNT
                  </TableCell>
                  <TableCell sx={{ fontSize: "10px", fontWeight: 800, color: "#64748B" }}>
                    ACTION TAKEN
                  </TableCell>
                  <TableCell sx={{ fontSize: "10px", fontWeight: 800, color: "#64748B" }}>
                    MODULE
                  </TableCell>
                  <TableCell sx={{ fontSize: "10px", fontWeight: 800, color: "#64748B" }}>
                    IP ADDRESS
                  </TableCell>
                  <TableCell sx={{ fontSize: "10px", fontWeight: 800, color: "#64748B" }}>
                    DETAILS
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => {
                    const isDelete = (log?.action || "")
                      .toLowerCase()
                      .includes("delete");
                    const isCreate = (log?.action || "")
                      .toLowerCase()
                      .includes("insert");

                    return (
                      <TableRow key={log._id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} color="#0F172A">
                            {moment(log.createdAt || log.timestamp).format("DD MMM YYYY")}
                          </Typography>
                          <Typography variant="caption" color="#94A3B8" fontSize="10px">
                            {moment(log.createdAt || log.timestamp).format("hh:mm A")}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                fontSize: "10px",
                                fontWeight: 800,
                                bgcolor: "#EFF6FF",
                                color: "#0256E8",
                              }}
                            >
                              {(log?.name || "S")[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={700} color="#0F172A">
                                {log?.name || "System"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="#94A3B8"
                                fontSize="9px"
                                sx={{ textTransform: "uppercase", fontWeight: 700 }}
                              >
                                {log?.role || "system"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={log?.action || "ACTION"}
                            size="small"
                            sx={{
                              bgcolor: isDelete
                                ? "#FEF2F2"
                                : isCreate
                                  ? "#ECFDF5"
                                  : "#EFF6FF",
                              color: isDelete
                                ? "#EF4444"
                                : isCreate
                                  ? "#059669"
                                  : "#0256E8",
                              fontWeight: 800,
                              fontSize: "10px",
                              borderRadius: "4px",
                              height: "22px",
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="#334155">
                            {log?.module || "N/A"}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            color="#64748B"
                            sx={{ fontFamily: "monospace", fontSize: "11px" }}
                          >
                            {log?.ip || "127.0.0.1"}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="caption" color="#64748B" fontWeight={500}>
                            {log?.customMessage || "—"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: "#94A3B8" }}>
                      No matching audit records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination Controls */}
        {pagination?.auditLogs?.totalPages > 1 && (
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2.5}>
            <Typography variant="caption" color="#64748B">
              Showing <strong>{filteredLogs.length}</strong> entries
            </Typography>
            <Pagination
              count={pagination?.auditLogs?.totalPages || 1}
              page={pagination?.auditLogs?.page || 1}
              onChange={(e, page) =>
                setPagination((prev) => ({
                  ...prev,
                  auditLogs: { ...prev.auditLogs, page },
                }))
              }
              color="primary"
              size="small"
            />
          </Box>
        )}
      </Paper>

      {/* 4. BOTTOM METRIC ANALYTICS CARDS */}
      <Grid container spacing={3}>
        {/* Card 1: Module Chart */}
        <Grid item xs={12} md={4}>
          <MetricCard>
            <Typography variant="caption" fontWeight={800} color="#64748B">
              ACTION DISTRIBUTION
            </Typography>
            <Box
              sx={{
                position: "relative",
                height: 140,
                my: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {allLogs?.length > 0 ? (
                <canvas ref={chartRef}></canvas>
              ) : (
                <Typography variant="caption" color="#94A3B8">
                  Waiting for data...
                </Typography>
              )}
            </Box>
            <Box display="flex" justifyContent="space-around">
              <Box textAlign="center">
                <Typography variant="h6" fontWeight={800} color="#0F172A">
                  {stats.total}
                </Typography>
                <Typography variant="caption" color="#94A3B8" fontSize="9px">
                  ENTRIES
                </Typography>
              </Box>
            </Box>
          </MetricCard>
        </Grid>

        {/* Card 2: Top Recent Action Logs */}
        <Grid item xs={12} md={4}>
          <MetricCard>
            <Typography variant="caption" fontWeight={800} color="#64748B" mb={2}>
              SECURITY EVENTS
            </Typography>
            <Box display="flex" flexDirection="column" gap={1.5}>
              {securityEvents.map((log, idx) => {
                const action = (log?.action || "").toLowerCase();
                const isCritical =
                  log.level === "error" || action.includes("failed");

                return (
                  <Box key={log._id || idx} display="flex" gap={1.5} alignItems="center">
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: isCritical ? "#FEF2F2" : "#EFF6FF",
                        color: isCritical ? "#EF4444" : "#0256E8",
                      }}
                    >
                      {isCritical ? (
                        <ErrorOutlineIcon fontSize="small" />
                      ) : (
                        <SecurityIcon fontSize="small" />
                      )}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={700} color="#0F172A">
                        {log?.action}
                      </Typography>
                      <Typography variant="caption" color="#94A3B8" fontSize="10px">
                        {moment(log.createdAt || log.timestamp).fromNow()}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </MetricCard>
        </Grid>

        {/* Card 3: Security & Critical Overview */}
        <Grid item xs={12} md={4}>
          <MetricCard>
            <Typography variant="caption" fontWeight={800} color="#64748B" mb={2}>
              SECURITY STATUS OVERVIEW
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: stats.critical > 0 ? "#FEF2F2" : "#F8FAFC",
                    borderRadius: "14px",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <Typography variant="caption" fontWeight={800} color="#EF4444">
                    CRITICAL
                  </Typography>
                  <Typography variant="h4" fontWeight={900} color="#0F172A" mt={0.5}>
                    0{stats.critical}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: "#F8FAFC",
                    borderRadius: "14px",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <Typography variant="caption" fontWeight={800} color="#64748B">
                    FAILED LOGINS
                  </Typography>
                  <Typography variant="h4" fontWeight={900} color="#0F172A" mt={0.5}>
                    0{stats.failedLogins}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mt={2}
              pt={1.5}
              borderTop="1px solid #F1F5F9"
            >
              <Typography variant="caption" color="#64748B" fontWeight={600}>
                Database status
              </Typography>
              <Chip
                icon={<CheckCircleOutlineIcon style={{ fontSize: 14, color: "#059669" }} />}
                label="CONNECTED"
                size="small"
                sx={{
                  bgcolor: "#ECFDF5",
                  color: "#059669",
                  fontWeight: 800,
                  fontSize: "9px",
                }}
              />
            </Box>
          </MetricCard>
        </Grid>
      </Grid>
    </RootContainer>
  );
};

export default AuditLogs;