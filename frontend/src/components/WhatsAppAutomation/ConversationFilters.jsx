import { Box, Button, Card, CardContent, Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { FilterListOutlined, RestartAltOutlined } from "@mui/icons-material";

const ConversationFilters = ({ filters, onFilterChange, onApply, onReset, options }) => {
    return (
        <Card sx={{ mb: 3, borderRadius: 4, boxShadow: "0 14px 40px rgba(15, 23, 42, 0.08)" }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1.5} sx={{ mb: 2.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Advanced Filters
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Refine conversations by patient, hospital, department, status, and communication type.
                    </Typography>
                </Stack>

                <Grid container spacing={2}>
                    <Grid item xs={12} md={6} lg={3}>
                        <TextField fullWidth label="Search" value={filters.search} onChange={(event) => onFilterChange("search", event.target.value)} placeholder="Patient name / mobile / UHID" size="small" />
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <TextField fullWidth select label="Hospital" value={filters.hospital} onChange={(event) => onFilterChange("hospital", event.target.value)} size="small">
                            {options.hospitals.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <TextField fullWidth select label="Branch" value={filters.branch} onChange={(event) => onFilterChange("branch", event.target.value)} size="small">
                            {options.branches.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <TextField fullWidth select label="Department" value={filters.department} onChange={(event) => onFilterChange("department", event.target.value)} size="small">
                            {options.departments.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <TextField fullWidth select label="Doctor" value={filters.doctor} onChange={(event) => onFilterChange("doctor", event.target.value)} size="small">
                            {options.doctors.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <TextField fullWidth select label="Conversation Status" value={filters.status} onChange={(event) => onFilterChange("status", event.target.value)} size="small">
                            {options.statuses.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <TextField fullWidth label="Date Range" value={filters.dateRange} onChange={(event) => onFilterChange("dateRange", event.target.value)} placeholder="e.g. 01 Jul - 30 Jul" size="small" />
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <TextField fullWidth select label="Assigned Executive" value={filters.executive} onChange={(event) => onFilterChange("executive", event.target.value)} size="small">
                            {options.executives.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <TextField fullWidth select label="Message Type" value={filters.messageType} onChange={(event) => onFilterChange("messageType", event.target.value)} size="small">
                            {options.messageTypes.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                        </TextField>
                    </Grid>
                </Grid>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2.5 }}>
                    <Button variant="contained" startIcon={<FilterListOutlined />} onClick={onApply}>
                        Apply Filters
                    </Button>
                    <Button variant="outlined" startIcon={<RestartAltOutlined />} onClick={onReset}>
                        Reset Filters
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default ConversationFilters;
