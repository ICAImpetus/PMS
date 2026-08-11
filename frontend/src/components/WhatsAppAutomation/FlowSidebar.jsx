import { useMemo, useState } from "react";
import {
    Box,
    Card,
    Chip,
    Divider,
    IconButton,
    InputAdornment,
    List,
    ListItemButton,
    Pagination,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import FilterListRounded from "@mui/icons-material/FilterListRounded";
import CircleRounded from "@mui/icons-material/CircleRounded";

const FlowSidebar = ({ flows, selectedFlowId, onSelectFlow, loading, error }) => {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const rowsPerPage = 4;

    const filteredFlows = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return flows;
        return flows.filter((flow) =>
            [flow.name, flow.hospitalName, flow.branch, flow.status, flow.createdBy]
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    }, [flows, search]);

    const pageCount = Math.max(1, Math.ceil(filteredFlows.length / rowsPerPage));
    const paginatedFlows = filteredFlows.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const handlePageChange = (_event, value) => setPage(value);

    return (
        <Card sx={{ borderRadius: 4, overflow: "hidden", height: "100%", boxShadow: "0 18px 50px rgba(15,23,42,0.08)" }}>
            <Box sx={{ p: 2.25, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={800}>Flow Library</Typography>
                        <Typography variant="caption" color="text.secondary">Search and switch between journeys</Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                        <IconButton size="small"><RefreshRounded fontSize="small" /></IconButton>
                        <IconButton size="small"><FilterListRounded fontSize="small" /></IconButton>
                    </Stack>
                </Stack>

                <TextField
                    fullWidth
                    size="small"
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                    }}
                    placeholder="Search flows"
                    sx={{ mt: 1.75 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {loading ? (
                <Box sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">Loading flows…</Typography>
                </Box>
            ) : error ? (
                <Box sx={{ p: 2 }}>
                    <Typography variant="body2" color="error">Unable to load flows.</Typography>
                </Box>
            ) : (
                <List disablePadding sx={{ p: 1.25, maxHeight: 530, overflowY: "auto" }}>
                    {paginatedFlows.map((flow) => {
                        const selected = flow.id === selectedFlowId;
                        return (
                            <ListItemButton
                                key={flow.id}
                                onClick={() => onSelectFlow(flow.id)}
                                sx={{
                                    borderRadius: 3,
                                    mb: 1,
                                    px: 1.25,
                                    py: 1.1,
                                    border: selected ? 1 : 0,
                                    borderColor: "primary.main",
                                    bgcolor: selected ? "primary.50" : "background.paper",
                                    boxShadow: selected ? "0 12px 28px rgba(3,169,244,0.15)" : "none",
                                    transition: "all 180ms ease",
                                    "&:hover": { bgcolor: selected ? "primary.50" : "grey.50", transform: "translateY(-1px)" },
                                }}
                            >
                                <Box sx={{ width: "100%" }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={700}>{flow.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{flow.hospitalName}</Typography>
                                        </Box>
                                        <Chip
                                            size="small"
                                            label={flow.status}
                                            color={flow.status === "Published" ? "success" : flow.status === "Archived" ? "default" : "warning"}
                                            variant="outlined"
                                        />
                                    </Stack>

                                    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                                        <Chip icon={<CircleRounded sx={{ fontSize: 10 }} />} size="small" label={`v${flow.version}`} variant="filled" />
                                        <Chip size="small" label={`${flow.totalNodes} nodes`} variant="outlined" />
                                        <Chip size="small" label={flow.publishStatus} variant="outlined" />
                                    </Stack>

                                    <Divider sx={{ my: 1 }} />
                                    <Stack direction="row" justifyContent="space-between" sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                                        <Typography variant="caption">Updated {flow.lastUpdated}</Typography>
                                        <Typography variant="caption">By {flow.createdBy}</Typography>
                                    </Stack>
                                </Box>
                            </ListItemButton>
                        );
                    })}
                </List>
            )}

            <Box sx={{ p: 1.5, borderTop: 1, borderColor: "divider" }}>
                <Pagination count={pageCount} page={page - 1} onChange={(_, value) => handlePageChange(null, value)} siblingCount={1} boundaryCount={1} />
            </Box>
        </Card>
    );
};

export default FlowSidebar;
