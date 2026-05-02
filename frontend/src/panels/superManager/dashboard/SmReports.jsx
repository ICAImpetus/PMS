import React from "react";
import "./Reports.css";

const SmReports = () => {
  return (
    <div className="reports-page">
      <div className="page-header">
        <h2><i className="fas fa-file-alt"></i> Advanced Reporting</h2>
      </div>

      <div className="card">
        <h3>Generate Custom Report</h3>
        <div className="report-form">
          <div className="form-group">
            <label>Report Type</label>
            <select className="input-select">
              <option>Performance Report</option>
              <option>Quality Audit</option>
              <option>Agent Activity</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date Range</label>
            <div className="date-group">
              <input type="date" className="input-select" /> to <input type="date" className="input-select" />
            </div>
          </div>
          <div className="form-group">
            <label>Format</label>
            <select className="input-select">
              <option>Excel</option>
              <option>PDF</option>
              <option>CSV</option>
            </select>
          </div>
        </div>
        <div className="metrics-check">
          <label><input type="checkbox" defaultChecked /> Quality Scores</label>
          <label><input type="checkbox" defaultChecked /> Call Volume</label>
          <label><input type="checkbox" defaultChecked /> AHT</label>
          <label><input type="checkbox" /> FCR</label>
          <label><input type="checkbox" /> CSAT</label>
        </div>
        <button className="btn btn-primary mt-20" onClick={() => alert("Report generation started...")}>Generate Report</button>
      </div>

      <div className="grid-3 mt-20">
        <div className="card report-template">
          <i className="fas fa-sun icon-lg"></i>
          <h4>Daily Summary</h4>
          <p>Ops overview for yesterday.</p>
          <button className="btn-sm">Download</button>
        </div>
        <div className="card report-template">
          <i className="fas fa-calendar-week icon-lg"></i>
          <h4>Weekly Quality</h4>
          <p>Audit scores and compliance.</p>
          <button className="btn-sm">Download</button>
        </div>
        <div className="card report-template">
          <i className="fas fa-chart-pie icon-lg"></i>
          <h4>Monthly Performance</h4>
          <p>Full KPI analysis.</p>
          <button className="btn-sm">Download</button>
        </div>
      </div>
    </div>
  );
};

export default SmReports;