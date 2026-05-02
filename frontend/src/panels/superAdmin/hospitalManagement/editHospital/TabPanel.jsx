import { Box } from "@mui/material";

// Helper TabPanel component (you can place this in a separate file like TabPanel.jsx)
const TabPanel = ({ children, value, selectedTab, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== selectedTab}
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      {...other}
    >
      {value === selectedTab && (
        <Box sx={{ p: 3 }}>
          {" "}
          {/* Add padding for content */}
          {children}
        </Box>
      )}
    </div>
  );
};

export default TabPanel;
