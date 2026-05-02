import React from "react";
import { Box, Grid, Typography, Paper, useTheme, Avatar } from "@mui/material";
import NotificationsIcon from '@mui/icons-material/Notifications';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CampaignIcon from '@mui/icons-material/Campaign';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CallIcon from '@mui/icons-material/Call';
import ChatIcon from '@mui/icons-material/Chat';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SettingsIcon from '@mui/icons-material/Settings';
import EventIcon from '@mui/icons-material/Event';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveLine } from '@nivo/line';
import { tokens } from "../../../theme";

const statData = [
  { title: "Leads", value: 120, icon: <AssignmentIcon />, color: "#1976d2" },
  { title: "Contacts", value: 340, icon: <PeopleIcon />, color: "#388e3c" },
  { title: "Accounts", value: 80, icon: <BusinessIcon />, color: "#fbc02d" },
  { title: "Opportunities", value: 45, icon: <AssignmentIcon />, color: "#7b1fa2" },
  { title: "Tasks", value: 60, icon: <AssignmentIcon />, color: "#0288d1" },
  { title: "Appointments", value: 22, icon: <EventIcon />, color: "#c2185b" },
  { title: "Cases", value: 15, icon: <AssignmentIcon />, color: "#e64a19" },
  { title: "Campaigns", value: 7, icon: <CampaignIcon />, color: "#0097a7" },
  { title: "Users", value: 18, icon: <PeopleIcon />, color: "#512da8" },
  { title: "Notifications", value: 5, icon: <NotificationsIcon />, color: "#455a64" },
  { title: "Documents", value: 30, icon: <InsertDriveFileIcon />, color: "#afb42b" },
  { title: "Integrations", value: 4, icon: <SettingsIcon />, color: "#6d4c41" },
  { title: "Call Logs", value: 120, icon: <CallIcon />, color: "#0288d1" },
  { title: "Chat", value: 40, icon: <ChatIcon />, color: "#d32f2f" },
  { title: "Feedback", value: 12, icon: <FeedbackIcon />, color: "#388e3c" },
];

const pieData = [
  { id: 'Won', label: 'Won', value: 30, color: '#388e3c' },
  { id: 'Negotiation', label: 'Negotiation', value: 20, color: '#fbc02d' },
  { id: 'Lost', label: 'Lost', value: 10, color: '#d32f2f' },
  { id: 'Prospecting', label: 'Prospecting', value: 25, color: '#1976d2' },
  { id: 'Proposal', label: 'Proposal', value: 15, color: '#7b1fa2' },
];

const lineData = [
  {
    id: 'Leads',
    color: '#1976d2',
    data: [
      { x: 'Jan', y: 30 },
      { x: 'Feb', y: 40 },
      { x: 'Mar', y: 50 },
      { x: 'Apr', y: 60 },
      { x: 'May', y: 80 },
      { x: 'Jun', y: 90 },
    ],
  },
  {
    id: 'Opportunities',
    color: '#7b1fa2',
    data: [
      { x: 'Jan', y: 10 },
      { x: 'Feb', y: 20 },
      { x: 'Mar', y: 25 },
      { x: 'Apr', y: 30 },
      { x: 'May', y: 35 },
      { x: 'Jun', y: 45 },
    ],
  },
];

const DashboardOverview = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, background: colors.primary[900], minHeight: "100vh", borderRadius: 2 }}>
      <Typography variant="h4" fontWeight={700} mb={3} color="primary.main">
        Dashboard Overview
      </Typography>
      {/* Stat Cards */}
      <Grid container spacing={2} mb={3}>
        {statData.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Paper elevation={2} sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2, background: colors.primary[800] }}>
              <Avatar sx={{ bgcolor: stat.color, width: 48, height: 48 }}>
                {stat.icon}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600} color={colors.grey[100]}>{stat.title}</Typography>
                <Typography variant="h5" fontWeight={700} color={colors.greenAccent[400]}>{stat.value}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      {/* Charts Row */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2, background: colors.primary[800], height: 340 }}>
            <Typography variant="h6" mb={1} color="primary.light">Sales Pipeline</Typography>
            <Box sx={{ height: 260 }}>
              <ResponsivePie
                data={pieData}
                margin={{ top: 30, right: 30, bottom: 30, left: 30 }}
                innerRadius={0.5}
                padAngle={1}
                cornerRadius={3}
                colors={{ datum: 'data.color' }}
                borderWidth={1}
                enableArcLabels={true}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor={colors.grey[100]}
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                theme={{
                  labels: { text: { fill: colors.grey[100] } },
                  legends: { text: { fill: colors.grey[100] } },
                }}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2, background: colors.primary[800], height: 340 }}>
            <Typography variant="h6" mb={1} color="primary.light">Leads & Opportunities Trend</Typography>
            <Box sx={{ height: 260 }}>
              <ResponsiveLine
                data={lineData}
                margin={{ top: 30, right: 30, bottom: 30, left: 40 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
                axisTop={null}
                axisRight={null}
                axisBottom={{ tickSize: 5, tickPadding: 5, tickRotation: 0, legend: '', legendOffset: 36, legendPosition: 'middle' }}
                axisLeft={{ tickSize: 5, tickPadding: 5, tickRotation: 0, legend: '', legendOffset: -40, legendPosition: 'middle' }}
                colors={{ datum: 'color' }}
                pointSize={8}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                enableArea={true}
                theme={{
                  axis: { ticks: { text: { fill: colors.grey[100] } } },
                  legends: { text: { fill: colors.grey[100] } },
                  tooltip: { container: { color: colors.primary[500] } },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      {/* Example: Recent Activities or Notifications */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2, background: colors.primary[800] }}>
            <Typography variant="h6" mb={1} color="primary.light">Recent Activities</Typography>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Lead John Doe added</li>
              <li>Contact Jane Smith updated</li>
              <li>Opportunity "Big Deal" moved to Negotiation</li>
              <li>Case #123 resolved</li>
              <li>Feedback received from client</li>
            </ul>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2, background: colors.primary[800] }}>
            <Typography variant="h6" mb={1} color="primary.light">Notifications</Typography>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>New campaign launched</li>
              <li>Appointment scheduled with Acme Corp</li>
              <li>Document "Proposal.pdf" uploaded</li>
              <li>Integration with WhatsApp successful</li>
              <li>Survey sent to 50 contacts</li>
            </ul>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardOverview;
