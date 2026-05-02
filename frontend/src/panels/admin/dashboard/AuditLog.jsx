import React, { useEffect, useState, useRef, useMemo, useContext } from 'react';
import Chart from 'chart.js/auto';
import './AdminPages.css';
import { useApi } from '../../../api/useApi';
import { commonRoutes } from '../../../api/apiService';
import { UserContextHook } from '../../../contexts/UserContexts';
import toast from 'react-hot-toast';
import moment from 'moment';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { tokens } from '../../../theme';
import HospitalContext from '../../../contexts/HospitalContexts';

const AuditLogs = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { currentUser } = UserContextHook();
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const accountCreationDate = useMemo(() => {
    const createdAt =
      currentUser?.createdAt ||
      currentUser?.created_at ||
      currentUser?.createdOn;
    if (!createdAt) return '';

    const parsed = moment(createdAt);
    return parsed.isValid() ? parsed.format('YYYY-MM-DD') : '';
  }, [currentUser]);


  const { allLogs, setAllLogs, loading, errors } = useContext(HospitalContext)


  const handleStartDateChange = (value) => {
    if (!value) return setStartDate('');

    const selected = moment(value, 'YYYY-MM-DD');
    const created = moment(accountCreationDate, 'YYYY-MM-DD');

    if (accountCreationDate && selected.isBefore(created)) {
      toast.error('Start date cannot be before your account creation date');
      return;
    }

    if (endDate && selected.isAfter(moment(endDate, 'YYYY-MM-DD'))) {
      toast.error('Start date cannot be after the end date');
      return;
    }

    setStartDate(value);
  };

  const handleEndDateChange = (value) => {
    if (value && accountCreationDate && moment(value).isBefore(moment(accountCreationDate, 'YYYY-MM-DD'))) {
      toast.error('End date cannot be before your account creation date');
      return;
    }
    if (value && startDate && moment(value).isBefore(moment(startDate, 'YYYY-MM-DD'))) {
      toast.error('End date cannot be before the start date');
      return;
    }
    setEndDate(value);
  };

  // Filtering Logic
  const filteredLogs = useMemo(() => {
    return allLogs?.filter(log => {
      const actionTarget = `${log.action || ''}`.toLowerCase();
      const detailsTarget = `${log.customMessage || ''}`.toLowerCase();
      const nameTarget = `${log.name || ''}`.toLowerCase();
      const searchTarget = `${nameTarget} ${actionTarget} ${detailsTarget}`;
      const matchesSearch = searchTerm === '' || searchTarget.includes(searchTerm.toLowerCase());

      const logDate = moment(log.createdAt || log.timestamp || log.date);
      const matchesStartDate = !startDate || (logDate.isValid() && logDate.isSameOrAfter(moment(startDate).startOf('day')));
      const matchesEndDate = !endDate || (logDate.isValid() && logDate.isSameOrBefore(moment(endDate).endOf('day')));

      const matchesFilterType = filterType === 'all' || (log.module || '').toLowerCase().includes(filterType.toLowerCase()) || (log.role || '').toLowerCase().includes(filterType.toLowerCase());

      return matchesSearch && matchesStartDate && matchesEndDate && matchesFilterType;
    }) || [];
  }, [allLogs, searchTerm, filterType, startDate, endDate]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, startDate, endDate]);

  // Statistics Calculation
  const stats = useMemo(
    () => {
      const total = allLogs?.length || [];
      const critical = allLogs?.filter(l => (l.level || '').toLowerCase() === 'error' || (l.level || '').toLowerCase() === 'critical')?.length || [];
      const failedLogins = allLogs?.filter(l => (l?.action || '').toLowerCase().includes('failed login'))?.length || [];

      return { total, critical, failedLogins };
    }, [allLogs]);

  // Recent Security Events (sidebar card)
  const securityEvents = useMemo(() => {
    return allLogs || []
      .filter(l => {
        const action = (l?.action || '').toLowerCase();
        return action.includes('login') || action.includes('password') || action.includes('security') || l.level === 'error';
      })
      .slice(0, 3);
  }, [allLogs]);

  // Chart Logic
  useEffect(() => {
    if (chartRef.current && allLogs.length > 0) {
      if (chartInstance.current) chartInstance.current.destroy();

      const moduleCounts = allLogs.reduce((acc, log) => {
        const mod = log?.module || 'Other';
        acc[mod] = (acc[mod] || 0) + 1;
        return acc;
      }, {});

      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'polarArea',
        data: {
          labels: Object.keys(moduleCounts),
          datasets: [{
            data: Object.values(moduleCounts),
            backgroundColor: [
              'rgba(156, 39, 176, 0.7)',
              'rgba(52, 152, 219, 0.7)',
              'rgba(231, 76, 60, 0.7)',
              'rgba(46, 204, 113, 0.7)',
              'rgba(243, 156, 18, 0.7)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: { ticks: { display: false } }
          }
        }
      });
    }
  }, [allLogs]);

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      toast.error("No logs to export");
      return;
    }

    const headers = ["Timestamp", "User", "Action", "Module", "Role", "IP Address", "Details"];
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map(log => {
        const m = log || {};
        return [
          `"${moment(log.createdAt || log.timestamp).format("YYYY-MM-DD HH:mm:ss")}"`,
          `"${m.name || 'System'}"`,
          `"${m.action || ''}"`,
          `"${m.module || ''}"`,
          `"${m.role || ''}"`,
          `"${m.ip || ''}"`,
          `"${(m.customMessage || '').replace(/"/g, '""')}"`
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `admin_audit_logs_${moment().format("YYYY-MM-DD")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Logs exported successfully");
  };
  const today = new Date().toISOString().split("T")[0];
  return (
    <div className="page-container" id="audit">
      <h2 className="section-title">Admin Audit Log</h2>

      <div className="filter-bar">
        <div className="filter-group">
          <span>🔍</span>
          <input
            type="text"
            className="filter-select"
            placeholder="Search by user"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>From:</label>
            <input
              type="date"
              className="date-input"
              value={startDate}
              min={accountCreationDate}
              max={endDate || undefined}
              onChange={(e) => handleStartDateChange(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>To:</label>
            <input
              type="date"
              className="date-input"
              value={endDate}
              min={startDate || accountCreationDate || undefined}
              max={endDate || today}
              onChange={(e) => handleEndDateChange(e.target.value)}
            />
          </div>
          {(startDate || endDate) && (
            <button
              className="btn btn-small btn-secondary"
              onClick={() => { setStartDate(''); setEndDate(''); }}
              title="Clear Dates"
            >
              ✕
            </button>
          )}
        </div>

        {/* <div className="filter-group">
          <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Modules</option>
            <option value="user">User Management</option>
            <option value="hospital">Hospital Management</option>
            <option value="admin">Admin Actions</option>
            <option value="security">Security</option>
            <option value="system">System</option>
          </select>
        </div> */}

        <div className="btn-group">
          <button className="btn btn-success" onClick={handleExport}>Export CSV</button>
          <button className="btn btn-secondary" onClick={loadLogs}>Refresh</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ margin: 0 }}>Recent Records</h3>
          <div className="btn-group">
            <span className="badge badge-info">{filteredLogs.length} Records Found</span>
          </div>
        </div>
        <div className="table-container">
          {loading && (
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              height="400px"
            >
              <CircularProgress
                size={40}
                sx={{ color: colors.blueAccent[500], mb: 2 }}
              />
              <Typography variant="body1" color="textSecondary">
                Loading Logs...
              </Typography>
            </Box>
          )}
          {!loading && (
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User / Account</th>
                  <th>Action Taken</th>
                  <th>Module</th>
                  <th>IP Address</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.length > 0 ? paginatedLogs.map(log => (
                  <tr key={log._id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600 }}>{moment(log.createdAt || log.timestamp).format("DD MMM YYYY")}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{moment(log.createdAt || log.timestamp).format("hh:mm A")}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{log?.name || 'System'}</div>
                      <div className="badge badge-primary" style={{ fontSize: '0.65rem', marginTop: '4px' }}>{log?.role || 'system'}</div>
                    </td>
                    <td>
                      <span className={`badge ${(log?.action || '').toLowerCase().includes('delete') ? 'badge-danger' :
                        (log?.action || '').toLowerCase().includes('insert') ? 'badge-success' : 'badge-info'
                        }`}>
                        {log?.action}
                      </span>
                    </td>
                    <td>{log?.module}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{log?.ip || 'N/A'}</td>
                    <td style={{ maxWidth: '300px', fontSize: '0.85rem' }}>{log?.customMessage}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>
                      {loading ? "Loading logs..." : "No matching records found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              &larr; Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next &rarr;
            </button>
          </div>
        )}
      </div>

      <div className="data-grid">
        <div className="data-card">
          <h4>Log Overview</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Entries</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: stats.critical > 0 ? 'var(--danger)' : 'inherit' }}>{stats.critical}</div>
              <div className="stat-label">Critical Events</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.failedLogins}</div>
              <div className="stat-label">Failed Logins</div>
            </div>
          </div>
          <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Database status:</span>
              <strong style={{ color: 'var(--success)' }}>Connected</strong>
            </div>
          </div>
        </div>

        <div className="data-card">
          <h4>Action Distribution</h4>
          <div className="chart-container-sm">
            {allLogs.length > 0 ? <canvas ref={chartRef}></canvas> : <div style={{ textAlign: 'center', marginTop: '50px' }}>Waiting for data...</div>}
          </div>
        </div>

        <div className="data-card">
          <h4>Security Dashboard</h4>
          <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '15px' }}>
            {securityEvents.map((log, idx) => {
              const action = (log?.action || '').toLowerCase();
              const isCritical = log.level === 'error' || action.includes('failed');
              const isWarning = action.includes('modify') || action.includes('update');

              return (
                <div className="log-entry" key={log._id || idx}>
                  <div className={`log-icon ${isCritical ? 'danger' : isWarning ? 'warning' : 'info'}`}>
                    <i className={`fas ${isCritical ? 'fa-exclamation-triangle' : isWarning ? 'fa-user-lock' : 'fa-shield-alt'}`}></i>
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div><strong>{log?.action}</strong></div>
                    <small style={{ color: 'var(--muted)' }}>{moment(log.createdAt || log.timestamp).fromNow()}</small>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;