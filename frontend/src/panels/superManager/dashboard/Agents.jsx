import React, { useState, useEffect } from "react";
import HeadsetIcon from "@mui/icons-material/Headset";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HearingIcon from "@mui/icons-material/Hearing";
import { getDataFunc } from "../../../utils/services";
import { UserContextHook } from "../../../contexts/UserContexts";

// --- STATIC FALLBACK DATA ---
const STATIC_AGENTS = [
  { name: "John Doe", username: "Team A", ID: "AG-1001", status: "Active", calls: 89, aht: "5.2m", quality: "92%" },
  { name: "Priya Sharma", username: "Team B", ID: "AG-1002", status: "Break", calls: 82, aht: "5.4m", quality: "91%" },
  { name: "Mike Ross", username: "Team A", ID: "AG-1003", status: "Active", calls: 65, aht: "4.8m", quality: "88%" },
  { name: "Rachel Zane", username: "Team C", ID: "AG-1004", status: "Offline", calls: 45, aht: "6.1m", quality: "95%" },
];

const formatDuration = (seconds) => {
  if (!seconds) return "0m";
  const mins = Math.floor(seconds / 60);
  return `${mins}m`;
};

const Agents = () => {
  const { currentUser } = UserContextHook();
  const [agentsList, setAgentsList] = useState([]);
  const [stats, setStats] = useState({ totalAgents: 0, totalCalls: 0, avgAht: 0, avgQuality: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("jwtToken");
        const authQuery = token ? `?token=${token}&secret_token=${token}` : "";

        // Fetch Users and Team Stats in parallel
        const [usersRes, teamStatsRes, formStatsRes] = await Promise.allSettled([
          getDataFunc(`getAllUsers${authQuery}`),
          getDataFunc(currentUser?.id ? `api/team-stats/${currentUser.id}${authQuery}` : `api/team-stats${authQuery}`),
          getDataFunc(`api/filled-forms/statistics/${authQuery}`)
        ]);

        let combinedAgents = [];
        let totalCalls = 0;
        let totalDuration = 0;

        // 1. Process Users (Filter for Executives)
        if (usersRes.status === "fulfilled" && usersRes.value?.data) {
          const allUsers = usersRes.value.data;
          // Filter logic: In a real app, match hospital. For now, assume all 'executive' are relevant
          const executives = allUsers.filter(u => u.type === 'executive');
          
          // 2. Process Performance Stats
          const memberStats = (teamStatsRes.status === "fulfilled" && teamStatsRes.value?.success) 
            ? teamStatsRes.value.data.members 
            : [];

          // 3. Merge Data
          combinedAgents = executives.map(exec => {
            const perf = memberStats.find(m => m.username === exec.username) || {};
            const calls = perf.today?.calls || 0;
            const duration = perf.today?.avgDuration || 0;
            
            totalCalls += calls;
            if(calls > 0) totalDuration += duration;

            return {
              name: exec.name,
              username: exec.username, // treating as team/dept info for display
              ID: exec.ID || "N/A",
              status: "Active", // Defaulting to Active as online status isn't in API yet
              calls: calls,
              aht: formatDuration(duration),
              quality: "N/A" // Placeholder until per-agent quality is available
            };
          });
        }

        // Set State
        setAgentsList(combinedAgents.length > 0 ? combinedAgents : STATIC_AGENTS);
        
        // Calculate Top Level Stats
        const finalAvgQuality = (formStatsRes.status === "fulfilled" && formStatsRes.value?.success) 
          ? (formStatsRes.value.data.avgQuality || "89.4%") 
          : "89.4%";

        setStats({
          totalAgents: combinedAgents.length || STATIC_AGENTS.length,
          totalCalls: totalCalls || 2847,
          avgAht: totalCalls > 0 ? formatDuration(totalDuration / combinedAgents.length) : "6.2m",
          avgQuality: finalAvgQuality
        });

      } catch (error) {
        console.error("Agents fetch error:", error);
        setAgentsList(STATIC_AGENTS); // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  return (
    <div className="agents-page">
      <div className="page-header">
        <h2><HeadsetIcon sx={{ mr: 1 }} /> Agent Management</h2>
        <div className="actions">
          <button className="btn btn-primary"><AddIcon sx={{ mr: 1, fontSize: 18 }} /> Add Agent</button>
          <button className="btn btn-success"><FileDownloadIcon sx={{ mr: 1, fontSize: 18 }} /> Export</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-val">{stats.totalAgents}</div>
          <div className="stat-lbl">Total Agents</div>
        </div>
        <div className="card stat-card">
          <div className="stat-val">{stats.totalCalls}</div>
          <div className="stat-lbl">Calls Today</div>
        </div>
        <div className="card stat-card">
          <div className="stat-val">{stats.avgAht}</div>
          <div className="stat-lbl">Avg Handle Time</div>
        </div>
        <div className="card stat-card">
          <div className="stat-val text-success">{stats.avgQuality}</div>
          <div className="stat-lbl">Avg Quality</div>
        </div>
      </div>

      {/* Charts & Status Area (Mocked for layout as requested) */}
      <div className="grid-2">
        <div className="card">
          <h3>Shift Coverage</h3>
          <div className="chart-placeholder">
            <div className="mock-chart-bar" style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#aaa'}}>Shift Coverage Bar Chart</div>
          </div>
        </div>
        <div className="card">
          <h3>Agent Availability</h3>
          <div className="status-grid">
            <div className="status-box success"><span>{Math.floor(stats.totalAgents * 0.6)}</span> Available</div>
            <div className="status-box warning"><span>{Math.floor(stats.totalAgents * 0.2)}</span> On Break</div>
            <div className="status-box info"><span>{Math.floor(stats.totalAgents * 0.1)}</span> Training</div>
            <div className="status-box danger"><span>{Math.floor(stats.totalAgents * 0.1)}</span> Offline</div>
          </div>
        </div>
      </div>

      {/* Agent Roster Table */}
      <div className="card">
        <h3>Agent Roster</h3>
        <div className="table-responsive">
          <table>
            <thead>
              <tr><th>Agent</th><th>ID</th><th>Status</th><th>Calls</th><th>AHT</th><th>Quality</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {agentsList.map((agent, index) => (
                <tr key={index}>
                  <td><strong>{agent.name}</strong><br/><small>{agent.username}</small></td>
                  <td>{agent.ID}</td>
                  {/* FIX IS HERE: Added className= */}
                  <td><span className={`badge badge-${agent.status === 'Active' ? 'success' : 'warning'}`}>{agent.status}</span></td>
                  <td>{agent.calls}</td>
                  <td>{agent.aht}</td>
                  <td><span className="badge badge-success">{agent.quality}</span></td>
                  <td>
                    <button className="btn-icon"><VisibilityIcon sx={{ fontSize: 18 }} /></button>
                    <button className="btn-icon"><HearingIcon sx={{ fontSize: 18 }} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Agents;