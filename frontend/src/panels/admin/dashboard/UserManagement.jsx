// UserManagement.jsx
import React, { useState, useEffect } from "react";
import "./UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulate API call to fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const mockUsers = [
          {
            id: 1,
            name: "System Admin",
            email: "admin@pms.example.com",
            role: "Administrator",
            dept: "IT",
            status: "Active",
            login: "Today, 08:15 AM",
            created: "Jan 15, 2022",
          },
          {
            id: 2,
            name: "Michael Roberts",
            email: "michael@pms.example.com",
            role: "Manager",
            dept: "Management",
            status: "Active",
            login: "Today, 08:00 AM",
            created: "Mar 10, 2023",
          },
          {
            id: 3,
            name: "Sarah Johnson",
            email: "sarah@pms.example.com",
            role: "Supervisor",
            dept: "Scheduling",
            status: "Active",
            login: "Today, 08:30 AM",
            created: "Jun 5, 2023",
          },
          {
            id: 4,
            name: "John Doe",
            email: "john@pms.example.com",
            role: "Agent",
            dept: "Scheduling",
            status: "Active",
            login: "Today, 08:05 AM",
            created: "Aug 20, 2023",
          },
          {
            id: 5,
            name: "Priya Sharma",
            email: "priya@pms.example.com",
            role: "Agent",
            dept: "Billing",
            status: "Active",
            login: "Today, 08:15 AM",
            created: "Sep 12, 2023",
          },
          {
            id: 6,
            name: "David Chen",
            email: "david@pms.example.com",
            role: "Supervisor",
            dept: "Billing",
            status: "Inactive",
            login: "Nov 10, 2023",
            created: "Jul 8, 2023",
          },
          {
            id: 7,
            name: "Emma Wilson",
            email: "emma@pms.example.com",
            role: "Agent",
            dept: "General",
            status: "Locked",
            login: "Nov 14, 2023",
            created: "Oct 3, 2023",
          },
          {
            id: 8,
            name: "Robert Garcia",
            email: "robert@pms.example.com",
            role: "Viewer",
            dept: "Management",
            status: "Pending",
            login: "Never",
            created: "Nov 15, 2023",
          },
        ];

        setUsers(mockUsers);
        setError(null);
      } catch (err) {
        setError("Failed to load users");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Loader component
  const Loader = () => (
    <div className="content-page">
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading users...</p>
      </div>
    </div>
  );

  // Error component
  const ErrorComponent = ({ message }) => (
    <div className="content-page">
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p>{message}</p>
        <button
          className="btn btn-add"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    </div>
  );

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorComponent message={error} />;
  }

  return (
    <div className="content-page">
      <div className="action-bar card">
        <select className="filter-select">
          <option>All Roles</option>
        </select>
        <select className="filter-select">
          <option>All Status</option>
        </select>
        <input
          type="text"
          className="search-input"
          placeholder="Search users..."
        />
        <div className="btn-group">
          <button className="btn btn-export">
            <i className="fas fa-file-excel"></i> Export
          </button>
          <button className="btn btn-add">
            <i className="fas fa-user-plus"></i> Add User
          </button>
          <button className="btn btn-bulk">
            <i className="fas fa-cogs"></i> Bulk Actions
          </button>
        </div>
      </div>

      <div className="card table-card">
        <div className="card-header">
          <h3>User Accounts</h3>
          <div className="header-actions">
            <button className="btn-purple-pill">
              Pending Approvals <span className="badge">2</span>
            </button>
            <button className="btn-orange-pill">
              Locked Accounts <span className="badge">7</span>
            </button>
          </div>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="user-profile-cell">
                    <div className={`avatar-initials avatar-${u.id}`}>
                      {u.name[0]}
                    </div>
                    <div>
                      <div className="u-name">{u.name}</div>
                      <div className="u-email-sub">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>{u.email}</td>
                <td>
                  <span className={`role-tag ${u.role.toLowerCase()}`}>
                    {u.role}
                  </span>
                </td>
                <td>{u.dept}</td>
                <td>
                  <span className={`status-tag ${u.status.toLowerCase()}`}>
                    {u.status}
                  </span>
                </td>
                <td>{u.login}</td>
                <td>{u.created}</td>
                <td className="actions-cell">
                  <i className="fas fa-edit"></i>
                  <i className="fas fa-key"></i>
                  <i
                    className={`fas fa-${u.status === "Locked" ? "unlock" : "lock"}`}
                  ></i>
                  <i className="fas fa-trash"></i>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="stats-action-grid">
        <div className="card stat-card">
          <h4>User Statistics</h4>
          <div className="stats-box-container">
            <div className="stat-box">
              <strong>247</strong>
              <span>Total Users</span>
            </div>
            <div className="stat-box">
              <strong>42</strong>
              <span>Admins</span>
            </div>
            <div className="stat-box">
              <strong>85</strong>
              <span>Managers</span>
            </div>
            <div className="stat-box">
              <strong>120</strong>
              <span>Agents</span>
            </div>
          </div>
          <div className="stat-footer">
            <span>
              Active Sessions: <strong>142</strong>
            </span>
            <span>
              Avg. Session Duration: <strong>4.2 hours</strong>
            </span>
          </div>
        </div>
        <div className="card chart-card">
          <h4>Role Distribution</h4>
          <div className="donut-placeholder"></div>
        </div>
        <div className="card quick-actions-card">
          <h4>Quick User Actions</h4>
          <button className="qa-btn purple">
            <i className="fas fa-user-plus"></i> Create New User
          </button>
          <button className="qa-btn light">
            <i className="fas fa-file-import"></i> Import Users
          </button>
          <button className="qa-btn orange">
            <i className="fas fa-key"></i> Reset Passwords
          </button>
          <button className="qa-btn red">
            <i className="fas fa-user-slash"></i> Deactivate Inactive
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
