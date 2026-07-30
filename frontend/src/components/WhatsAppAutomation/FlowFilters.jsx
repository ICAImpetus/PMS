import { Box, Button, Card, Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";

const FlowFilters = ({ filters, onFilterChange, onApply, onReset }) => {
    return (
        <Card sx={{ borderRadius: 4, p: 2.25, mb: 3, boxShadow: "0 18px 50px rgba(15,23,42,0.08)" }}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>Filter Workspace</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                    <TextField fullWidth size="small" label="Search by Flow Name" value={filters.search} onChange={(event) => onFilterChange("search", event.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                    <TextField fullWidth select size="small" label="Hospital" value={filters.hospital} onChange={(event) => onFilterChange("hospital", event.target.value)}>
                        <MenuItem value="All Hospitals">All Hospitals</MenuItem>
                        <MenuItem value="Jindal Hospital">Jindal Hospital</MenuItem>
                        <MenuItem value="Metro Care Hospital">Metro Care Hospital</MenuItem>
                        <MenuItem value="Saraswati Hospital">Saraswati Hospital</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                    <TextField fullWidth select size="small" label="Branch" value={filters.branch} onChange={(event) => onFilterChange("branch", event.target.value)}>
                        <MenuItem value="All Branches">All Branches</MenuItem>
                        <MenuItem value="Cardiology">Cardiology</MenuItem>
                        <MenuItem value="General OPD">General OPD</MenuItem>
                        <MenuItem value="Billing Desk">Billing Desk</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                    <TextField fullWidth select size="small" label="Flow Status" value={filters.status} onChange={(event) => onFilterChange("status", event.target.value)}>
                        <MenuItem value="All Status">All Status</MenuItem>
                        <MenuItem value="Draft">Draft</MenuItem>
                        <MenuItem value="Published">Published</MenuItem>
                        <MenuItem value="Archived">Archived</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                    <TextField fullWidth size="small" label="Last Updated" value={filters.dateRange} onChange={(event) => onFilterChange("dateRange", event.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                    <TextField fullWidth select size="small" label="Created By" value={filters.createdBy} onChange={(event) => onFilterChange("createdBy", event.target.value)}>
                        <MenuItem value="All Creators">All Creators</MenuItem>
                        <MenuItem value="Asha Verma">Asha Verma</MenuItem>
                        <MenuItem value="Rahul Mehta">Rahul Mehta</MenuItem>
                        <MenuItem value="Nisha Patel">Nisha Patel</MenuItem>
                    </TextField>
                </Grid>
            </Grid>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} justifyContent="flex-end" sx={{ mt: 2 }}>
                <Button variant="outlined" onClick={onReset}>Reset</Button>
                <Button variant="contained" onClick={onApply}>Apply Filters</Button>
            </Stack>
        </Card>
    );
};

export default FlowFilters;
