import React, { useState, useEffect } from "react";
import "./CallCenter.css";
import { getDataFunc } from "../../../utils/services";
import { UserContextHook } from "../../../contexts/UserContexts";

// --- STATIC FALLBACK DATA ---
const STATIC_QUEUE = [
  { id: "C-12436", wait: "8m 24s", type: "Billing", priority: "High" },
  { id: "C-12437", wait: "6m 12s", type: "Scheduling", priority: "Medium" },
  { id: "C-12438", wait: "2m 05s", type: "General", priority: "Low" },
];

const CallCenter = () => {
  const { currentUser } = UserContextHook();
  const [metrics, setMetrics] = useState({ inQueue: 18, abandon: "4.2%", answer: "98%", total: 3245 });
  const [queueList, setQueueList] = useState(STATIC_QUEUE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("jwtToken");
        const authQuery = token ? `?token=${token}&secret_token=${token}` : "";

        // Fetch Stats and List
        const [statsRes, listRes] = await Promise.allSettled([
          getDataFunc(currentUser?.id ? `api/getCallStats/${currentUser.id}${authQuery}` : `api/getCallStats${authQuery}`),
          getDataFunc(`api/getCallData${authQuery}`)
        ]);

        // Process Stats
        if (statsRes.status === "fulfilled" && statsRes.value?.success) {
          const data = statsRes.value.data;
          setMetrics({
            inQueue: data.activeCalls || 0, // Mapping active calls to In Queue for this view
            abandon: "4.5%", // Static for now, usually needs specific calculation
            answer: "95%",
            total: data.todaysCalls || 0
          });
        }

        // Process List (Simulating Queue from recent calls)
        if (listRes.status === "fulfilled" && listRes.value?.success && Array.isArray(listRes.value.data)) {
          // In a real app, you'd filter by 'status === queued'. 
          // Here we just take the latest 3 active-looking calls or fallback
          const calls = listRes.value.data;
          if (calls.length > 0) {
            const recent = calls.slice(0, 5).map(c => ({
              id: c._id ? c._id.substring(call.length - 6) : "C-API",
              wait: "0m 30s", // Mock wait time
              type: c.Direction || "Inbound",
              priority: "Normal"
            }));
            setQueueList(recent);
          }
        }

      } catch (error) {
        console.error("Call Center fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, [currentUser]);

  return (
    <div className="calls-page">
      <div className="page-header">
        <h2><i className="fas fa-phone"></i> Call Center Operations</h2>
        <div className="btn-group">
          <button className="btn btn-success"><i className="fas fa-sync"></i> Refresh</button>
          <button className="btn btn-primary"><i className="fas fa-tv"></i> Live Monitor</button>
        </div>
      </div>

      {/* Critical Metrics */}
      <div className="stats-grid">
        <div className="card metric danger">
          <div className="val">{metrics.inQueue}</div><div className="lbl">Active/Queue</div>
        </div>
        <div className="card metric warning">
          <div className="val">{metrics.abandon}</div><div className="lbl">Abandon Rate</div>
        </div>
        <div className="card metric success">
          <div className="val">{metrics.answer}</div><div className="lbl">Answer Rate</div>
        </div>
        <div className="card metric info">
          <div className="val">{metrics.total}</div><div className="lbl">Calls Today</div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid-2">
        <div className="card">
          <h3>Volume Trends (Hourly)</h3>
          <div className="chart-placeholder" style={{color:'#888', display:'flex', justifyContent:'center', alignItems:'center'}}>Line Chart: Calls per Hour</div>
        </div>
        <div className="card">
          <h3>Distribution by Dept</h3>
          <div className="chart-placeholder" style={{color:'#888', display:'flex', justifyContent:'center', alignItems:'center'}}>Donut Chart: Dept Split</div>
        </div>
      </div>

      {/* Live Queue */}
      <div className="card">
        <h3>Real-time Queue / Recent Activity</h3>
        <table>
          <thead><tr><th>Pos</th><th>ID</th><th>Wait Time</th><th>Type</th><th>Priority</th><th>Action</th></tr></thead>
          <tbody>
            {queueList.map((item, index) => (
              <tr key={index}>
                <td><strong>{index + 1}</strong></td>
                <td>{item.id}</td>
                <td><span className="badge warning">{item.wait}</span></td>
                <td>{item.type}</td>
                <td><span className={`badge ${item.priority === 'High' ? 'danger' : 'success'}`}>{item.priority}</span></td>
                <td><button className="btn-xs primary">Assign</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CallCenter;