import React, { useState } from "react";
import BoltIcon from "@mui/icons-material/Bolt";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SchoolIcon from "@mui/icons-material/School";
import StorageIcon from "@mui/icons-material/Storage";

const STATIC_ACTIONS = [
  { action: "Review Team C Calls", priority: "High", assigned: "Michael R.", due: "Today", status: "In Progress" },
  { action: "Approve Overtime", priority: "Medium", assigned: "Michael R.", due: "Today", status: "Pending" },
  { action: "Update Script", priority: "Low", assigned: "Sarah J.", due: "Tomorrow", status: "Pending" }
];

const ActionCenter = () => {
  const [actions] = useState(STATIC_ACTIONS);

  return (
    <div className="action-page">
      <div className="page-header">
        <h2><BoltIcon sx={{ mr: 1 }} /> Action Center</h2>
        <button className="btn btn-primary"><AddIcon sx={{ mr: 1, fontSize: 18 }} /> Create Action</button>
      </div>

      <div className="grid-4">
        <div className="card action-card critical">
          <div className="ac-icon danger"><AccessTimeIcon /></div>
          <h4>Staffing Alert</h4>
          <p>3 agents sick for evening shift</p>
          <span className="badge danger">CRITICAL</span>
        </div>
        <div className="card action-card high">
          <div className="ac-icon warning"><TrendingUpIcon /></div>
          <h4>Quality Drop</h4>
          <p>Team C below 85% threshold</p>
          <span className="badge warning">HIGH</span>
        </div>
        <div className="card action-card medium">
          <div className="ac-icon info"><SchoolIcon /></div>
          <h4>Training Due</h4>
          <p>5 agents need compliance refresh</p>
          <span className="badge info">MEDIUM</span>
        </div>
        <div className="card action-card low">
          <div className="ac-icon primary"><StorageIcon /></div>
          <h4>Maintenance</h4>
          <p>System update at 2AM</p>
          <span className="badge primary">SCHEDULED</span>
        </div>
      </div>

      <div className="card mt-20">
        <h3>Pending Actions</h3>
        <table>
          <thead><tr><th>Action</th><th>Priority</th><th>Assigned To</th><th>Due</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {actions.map((act, i) => (
              <tr key={i}>
                <td>{act.action}</td>
                <td><span className={`badge ${act.priority === 'High' ? 'danger' : act.priority === 'Medium' ? 'warning' : 'primary'}`}>{act.priority}</span></td>
                <td>{act.assigned}</td>
                <td>{act.due}</td>
                <td>{act.status}</td>
                <td><button className="btn-xs success">Complete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActionCenter;