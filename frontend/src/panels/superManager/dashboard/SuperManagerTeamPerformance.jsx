import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Radar } from "react-chartjs-2";
import "./Performance.css";
import { getDataFunc } from "../../../utils/services";
import { UserContextHook } from "../../../contexts/UserContexts";

// --- REGISTER CHART COMPONENTS ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale, // Critical for Radar charts
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// --- STATIC FALLBACK DATA ---
const STATIC_DEPT_DATA = [
  { dept: "Scheduling", agents: 12, calls: "1,245", quality: "92.5%", aht: "5.8m", status: "Optimal", statusClass: "success" },
  { dept: "Billing", agents: 8, calls: "892", quality: "86.2%", aht: "8.2m", status: "Check", statusClass: "warning" },
  { dept: "Emergency", agents: 6, calls: "458", quality: "94.1%", aht: "4.5m", status: "Optimal", statusClass: "success" },
];

const Performance = () => {
  const { currentUser } = UserContextHook();
  const [deptData, setDeptData] = useState(STATIC_DEPT_DATA);

  // --- CHART DATA CONFIGURATION ---
  
  // 1. KPI Trends (Line Chart)
  const lineChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Avg Quality Score",
        data: [88, 89, 87, 90, 91, 92.5],
        borderColor: "#2ecc71",
        backgroundColor: "rgba(46, 204, 113, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Target",
        data: [90, 90, 90, 90, 90, 90],
        borderColor: "#e74c3c",
        borderDash: [5, 5],
        borderWidth: 1,
        pointRadius: 0,
      }
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: false, min: 80, max: 100 }
    }
  };

  // 2. Radar Chart (Performance vs Target)
  const radarChartData = {
    labels: ["Quality", "Efficiency (AHT)", "Volume", "CSAT", "Adherence"],
    datasets: [
      {
        label: "Current Performance",
        data: [92, 85, 78, 88, 95],
        backgroundColor: "rgba(52, 152, 219, 0.2)",
        borderColor: "#3498db",
        borderWidth: 2,
      },
      {
        label: "Target Goals",
        data: [90, 90, 80, 90, 90],
        backgroundColor: "rgba(149, 165, 166, 0.2)",
        borderColor: "#95a5a6",
        borderWidth: 1,
        borderDash: [5, 5],
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { display: false },
        suggestedMin: 50,
        suggestedMax: 100,
      },
    },
  };

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchPerf = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const authQuery = token ? `?token=${token}&secret_token=${token}` : "";
        
        // Fetch team stats to aggregate by department
        const res = await getDataFunc(currentUser?.id ? `api/team-stats/${currentUser.id}${authQuery}` : `api/team-stats${authQuery}`);

        if (res.success && res.data && res.data.members.length > 0) {
          // Mock aggregation: In real app, group members by department field
          const totalCalls = res.data.members.reduce((acc, m) => acc + (m.today?.calls || 0), 0);
          const activeAgents = res.data.members.length;
          
          setDeptData([
            { dept: "General / Mixed", agents: activeAgents, calls: totalCalls, quality: "91%", aht: "5.5m", status: "Active", statusClass: "success" },
            ...STATIC_DEPT_DATA.slice(1) 
          ]);
        }
      } catch (e) {
        console.error("Performance fetch error", e);
      }
    };
    fetchPerf();
  }, [currentUser]);

  return (
    <div className="perf-page">
      <div className="page-header">
        <h2><i className="fas fa-chart-line"></i> Performance Analytics</h2>
        <select className="filter-select">
          <option>This Month</option>
          <option>Last Month</option>
        </select>
      </div>

      <div className="grid-2">
        {/* KPI TRENDS CHART */}
        <div className="card">
          <h3>KPI Trends</h3>
          <div className="chart-container" style={{ height: "300px", position: "relative" }}>
            <Line data={lineChartData} options={lineOptions} />
          </div>
        </div>

        {/* RADAR CHART */}
        <div className="card">
          <h3>Performance vs Target</h3>
          <div className="chart-container" style={{ height: "300px", position: "relative" }}>
            <Radar data={radarChartData} options={radarOptions} />
          </div>
        </div>
      </div>

      <div className="card mt-20">
        <h3>Department Summary</h3>
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Agents</th>
              <th>Calls</th>
              <th>Quality</th>
              <th>Handle Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {deptData.map((row, i) => (
              <tr key={i}>
                <td>{row.dept}</td>
                <td>{row.agents}</td>
                <td>{row.calls}</td>
                <td><span className={`text-${row.statusClass === 'warning' ? 'warning' : 'success'}`}>{row.quality}</span></td>
                <td>{row.aht}</td>
                <td><span className={`badge ${row.statusClass}`}>{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Performance;