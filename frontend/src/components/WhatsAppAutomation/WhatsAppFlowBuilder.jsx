import { useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    MenuItem,
    Skeleton,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import FileUploadRounded from "@mui/icons-material/FileUploadRounded";
import SaveRounded from "@mui/icons-material/SaveRounded";
import PublishRounded from "@mui/icons-material/PublishRounded";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import SearchOffRounded from "@mui/icons-material/SearchOffRounded";

import FlowSidebar from "./FlowSidebar";
import FlowCanvas from "./FlowCanvas";
import NodeConfigurationPanel from "./NodeConfigurationPanel";
import FlowFilters from "./FlowFilters";
import FlowStatistics from "./FlowStatistics";
import MobilePreview from "./MobilePreview";
import FlowValidationPanel from "./FlowValidationPanel";
import VersionHistory from "./VersionHistory";
import FlowAnalytics from "./FlowAnalytics";
import { dummyFlows } from "./dummyFlows";

const initialFilters = {
    search: "",
    hospital: "All Hospitals",
    branch: "All Branches",
    status: "All Status",
    dateRange: "",
    createdBy: "All Creators",
};

const WhatsAppFlowBuilder = () => {
    const [flows, setFlows] = useState(dummyFlows);
    const [selectedFlowId, setSelectedFlowId] = useState(dummyFlows[0]?.id || "");
    const [selectedNode, setSelectedNode] = useState(dummyFlows[0]?.nodes?.[0] || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [filters, setFilters] = useState(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState(initialFilters);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newFlowDraft, setNewFlowDraft] = useState({
        name: "",
        hospital: "Jindal Hospital",
        branch: "Cardiology",
        createdBy: "You",
    });
    const [actionMessage, setActionMessage] = useState("");

    const filteredFlows = useMemo(() => {
        const query = appliedFilters.search.trim().toLowerCase();
        return flows.filter((flow) => {
            const matchesSearch = !query || flow.name.toLowerCase().includes(query);
            const matchesHospital = appliedFilters.hospital === "All Hospitals" || flow.hospital === appliedFilters.hospital;
            const matchesBranch = appliedFilters.branch === "All Branches" || flow.branch === appliedFilters.branch;
            const matchesStatus = appliedFilters.status === "All Status" || flow.status === appliedFilters.status;
            const matchesDate = !appliedFilters.dateRange || flow.lastUpdated.includes(appliedFilters.dateRange);
            const matchesCreator = appliedFilters.createdBy === "All Creators" || flow.createdBy === appliedFilters.createdBy;
            return matchesSearch && matchesHospital && matchesBranch && matchesStatus && matchesDate && matchesCreator;
        });
    }, [appliedFilters, flows]);

    const selectedFlow = useMemo(() => {
        return filteredFlows.find((flow) => flow.id === selectedFlowId) || filteredFlows[0] || flows[0] || null;
    }, [filteredFlows, flows, selectedFlowId]);

    const handleSelectFlow = (flowId) => {
        const nextFlow = flows.find((flow) => flow.id === flowId);
        setSelectedFlowId(flowId);
        setSelectedNode(nextFlow?.nodes?.[0] || null);
    };

    const handleFilterChange = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        setAppliedFilters(filters);
    };

    const resetFilters = () => {
        setFilters(initialFilters);
        setAppliedFilters(initialFilters);
    };

    const openCreateFlowDialog = () => {
        setNewFlowDraft({ name: "", hospital: "Jindal Hospital", branch: "Cardiology", createdBy: "You" });
        setCreateDialogOpen(true);
        setActionMessage("");
    };

    const handleCreateFlow = () => {
        const flowName = newFlowDraft.name.trim();
        if (!flowName) {
            setActionMessage("Please enter a flow name before creating the workflow.");
            return;
        }

        const flowId = `flow-${Date.now()}`;
        const createdFlow = {
            id: flowId,
            name: flowName,
            hospitalName: newFlowDraft.hospital,
            branch: newFlowDraft.branch,
            status: "Draft",
            version: 1.0,
            lastUpdated: "Just now",
            createdBy: newFlowDraft.createdBy,
            totalNodes: 3,
            publishStatus: "Draft",
            hospital: newFlowDraft.hospital,
            nodes: [
                {
                    id: `${flowId}-start`,
                    name: "Start",
                    type: "Start Node",
                    messageContent: "Welcome to your new flow.",
                    headerText: "Start",
                    footerText: "Tap to begin",
                    dynamicVariables: "",
                    quickReplies: ["Continue"],
                    listOptions: [],
                    validationRules: "Required",
                    retryCount: 0,
                    timeoutSeconds: 15,
                    httpMethod: "GET",
                    apiUrl: "",
                    jsonPayload: "{}",
                    variableMapping: "",
                    errorHandling: "Ask again",
                    successPath: "Welcome Message",
                    failurePath: "Retry",
                    notes: "Initial step for the newly created flow.",
                    position: { x: 40, y: 80 },
                    nextNodeId: `${flowId}-welcome`,
                },
                {
                    id: `${flowId}-welcome`,
                    name: "Welcome Message",
                    type: "Welcome Message",
                    messageContent: "Hello {patientName}, thank you for contacting us.",
                    headerText: "Welcome",
                    footerText: "Select an option",
                    dynamicVariables: "{patientName}",
                    quickReplies: ["Book Appointment", "Get Help"],
                    listOptions: [],
                    validationRules: "Optional",
                    retryCount: 1,
                    timeoutSeconds: 20,
                    httpMethod: "GET",
                    apiUrl: "",
                    jsonPayload: "{}",
                    variableMapping: "",
                    errorHandling: "Show fallback",
                    successPath: "End Node",
                    failurePath: "Retry",
                    notes: "Greets the patient and offers options.",
                    position: { x: 280, y: 80 },
                    nextNodeId: `${flowId}-end`,
                },
                {
                    id: `${flowId}-end`,
                    name: "End Node",
                    type: "End Node",
                    messageContent: "We have received your request. Thank you.",
                    headerText: "Thanks",
                    footerText: "Conversation complete",
                    dynamicVariables: "",
                    quickReplies: [],
                    listOptions: [],
                    validationRules: "Optional",
                    retryCount: 0,
                    timeoutSeconds: 10,
                    httpMethod: "GET",
                    apiUrl: "",
                    jsonPayload: "{}",
                    variableMapping: "",
                    errorHandling: "",
                    successPath: "",
                    failurePath: "",
                    notes: "Ends the new flow gracefully.",
                    position: { x: 520, y: 80 },
                    nextNodeId: null,
                },
            ],
            validation: {
                missingConnections: 0,
                orphanNodes: 0,
                duplicateNodeNames: 0,
                unreachablePaths: 0,
                missingEndNodes: 0,
                invalidConfigurations: 0,
            },
            analytics: {
                totalExecutions: 0,
                successRate: 0,
                humanHandoverRate: 0,
                averageCompletionTime: "0m 00s",
                dropOffRate: 0,
                mostClickedButtons: [],
            },
            versions: [{ version: 1.0, updatedAt: "Just now", note: "Created from scratch" }],
            recentActivity: [{ id: 1, title: `Created ${flowName} flow`, time: "Just now" }],
            preview: {
                title: flowName,
                messages: [
                    { type: "bot", text: "Hello! We are ready to assist you." },
                    { type: "user", text: "Continue" },
                    { type: "bot", text: "Thanks, your request has been received." },
                ],
            },
        };

        setFlows((prev) => [createdFlow, ...prev]);
        setSelectedFlowId(flowId);
        setSelectedNode(createdFlow.nodes[0]);
        setCreateDialogOpen(false);
        setActionMessage(`Created ${flowName} successfully.`);
    };

    const handleSaveDraft = () => {
        if (!selectedFlow) {
            setActionMessage("Create a flow first before saving it.");
            return;
        }
        setFlows((prev) => prev.map((flow) => flow.id === selectedFlow.id ? { ...flow, status: "Draft", publishStatus: "Draft", lastUpdated: "Just now", recentActivity: [{ id: Date.now(), title: `Saved draft for ${flow.name}`, time: "Just now" }, ...(flow.recentActivity || []).slice(0, 2)] } : flow));
        setActionMessage(`Saved ${selectedFlow.name} as a draft.`);
    };

    const handlePublishFlow = () => {
        if (!selectedFlow) {
            setActionMessage("Select a flow before publishing it.");
            return;
        }
        setFlows((prev) => prev.map((flow) => flow.id === selectedFlow.id ? { ...flow, status: "Published", publishStatus: "Live", lastUpdated: "Just now", recentActivity: [{ id: Date.now(), title: `Published ${flow.name}`, time: "Just now" }, ...(flow.recentActivity || []).slice(0, 2)] } : flow));
        setActionMessage(`Published ${selectedFlow.name} successfully.`);
    };

    const handleCloneFlow = () => {
        if (!selectedFlow) {
            setActionMessage("Select a flow before cloning it.");
            return;
        }

        const clonedFlow = {
            ...selectedFlow,
            id: `flow-${Date.now()}`,
            name: `${selectedFlow.name} Copy`,
            version: Number((selectedFlow.version + 0.1).toFixed(1)),
            status: "Draft",
            publishStatus: "Draft",
            lastUpdated: "Just now",
            createdBy: "You",
            nodes: selectedFlow.nodes.map((node, index) => ({ ...node, id: `${Date.now()}-${index}-${node.id}` })),
            recentActivity: [{ id: Date.now(), title: `Cloned ${selectedFlow.name}`, time: "Just now" }],
            preview: { ...selectedFlow.preview, title: `${selectedFlow.name} Copy` },
        };

        setFlows((prev) => [clonedFlow, ...prev]);
        setSelectedFlowId(clonedFlow.id);
        setSelectedNode(clonedFlow.nodes[0]);
        setActionMessage(`Cloned ${selectedFlow.name} into a new draft.`);
    };

    const handleDeleteFlow = () => {
        if (!selectedFlow) {
            setActionMessage("No flow is currently selected to delete.");
            return;
        }

        const remainingFlows = flows.filter((flow) => flow.id !== selectedFlow.id);
        setFlows(remainingFlows);
        const fallbackFlow = remainingFlows[0] || null;
        setSelectedFlowId(fallbackFlow?.id || "");
        setSelectedNode(fallbackFlow?.nodes?.[0] || null);
        setActionMessage(`Deleted ${selectedFlow.name}.`);
    };

    const retryLoad = () => {
        setLoading(true);
        setError(false);
        setTimeout(() => {
            setFlows(dummyFlows);
            setSelectedFlowId(dummyFlows[0]?.id || "");
            setSelectedNode(dummyFlows[0]?.nodes?.[0] || null);
            setLoading(false);
        }, 500);
    };

    const renderLoadingState = () => (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Card sx={{ borderRadius: 4, p: 2.5, mb: 3 }}>
                <Skeleton variant="text" width="35%" height={36} />
                <Skeleton variant="text" width="55%" height={24} sx={{ mt: 0.75 }} />
            </Card>
            <FlowStatistics />
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}><Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} /></Grid>
                <Grid item xs={12} md={8}><Skeleton variant="rectangular" height={520} sx={{ borderRadius: 4 }} /></Grid>
            </Grid>
        </Container>
    );

    const renderEmptyState = () => (
        <Box sx={{ p: 5, textAlign: "center", borderRadius: 4, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
            <SearchOffRounded sx={{ fontSize: 56, color: "text.secondary", mb: 1.5 }} />
            <Typography variant="h6" fontWeight={700}>No Flows Found</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440, mx: "auto", mt: 0.75 }}>
                Try adjusting the filters or create a new flow from the header actions.
            </Typography>
        </Box>
    );

    if (loading) return renderLoadingState();

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Card sx={{ borderRadius: 4, overflow: "hidden", boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)" }}>
                <Box sx={{ p: { xs: 2.4, md: 3.2 }, background: "linear-gradient(135deg, #f8fbff 0%, #f9f5ff 100%)" }}>
                    <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", lg: "center" }} spacing={2}>
                        <Box>
                            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 0.75 }}>
                                <AutoAwesomeRounded color="primary" sx={{ fontSize: 28 }} />
                                <Typography variant="h4" fontWeight={800}>WhatsApp Flow Builder</Typography>
                            </Stack>
                            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760 }}>
                                Design intelligent no-code WhatsApp chatbot journeys for patients, from appointment booking to emergency triage.
                            </Typography>
                        </Box>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap">
                            <Button variant="contained" startIcon={<AddRounded />} onClick={openCreateFlowDialog}>Create New Flow</Button>
                            <Button variant="outlined" startIcon={<FileUploadRounded />}>Import Flow</Button>
                            <Button variant="outlined" startIcon={<SaveRounded />} onClick={handleSaveDraft}>Save Draft</Button>
                            <Button variant="outlined" startIcon={<PublishRounded />} onClick={handlePublishFlow}>Publish Flow</Button>
                            <Button variant="outlined" startIcon={<ContentCopyRounded />} onClick={handleCloneFlow}>Clone Flow</Button>
                            <Button variant="outlined" color="error" startIcon={<DeleteRounded />} onClick={handleDeleteFlow}>Delete Flow</Button>
                            <Button variant="contained" disabled startIcon={<VisibilityRounded />}>Preview on WhatsApp</Button>
                        </Stack>
                    </Stack>
                </Box>
            </Card>

            {error && (
                <Alert severity="error" sx={{ my: 2 }} action={<Button color="inherit" size="small" onClick={retryLoad}>Retry</Button>}>
                    We could not load the demo experience; retrying now restores local starter content.
                </Alert>
            )}

            {actionMessage && (
                <Alert severity="success" sx={{ my: 2 }} onClose={() => setActionMessage("")}>
                    {actionMessage}
                </Alert>
            )}

            <Box sx={{ mt: 3 }}>
                <FlowStatistics flows={flows} />
            </Box>

            <FlowFilters filters={filters} onFilterChange={handleFilterChange} onApply={applyFilters} onReset={resetFilters} />

            <Grid container spacing={3}>
                <Grid item xs={12} lg={3}>
                    <FlowSidebar flows={filteredFlows} selectedFlowId={selectedFlow?.id} onSelectFlow={handleSelectFlow} loading={loading} error={error} />
                </Grid>

                <Grid item xs={12} lg={6}>
                    {selectedFlow ? (
                        <Stack spacing={2}>
                            <FlowCanvas flow={selectedFlow} selectedNode={selectedNode} onSelectNode={setSelectedNode} />
                            <FlowValidationPanel flow={selectedFlow} />
                        </Stack>
                    ) : (
                        renderEmptyState()
                    )}
                </Grid>

                <Grid item xs={12} lg={3}>
                    <Stack spacing={2}>
                        <NodeConfigurationPanel node={selectedNode} onCancel={() => setSelectedNode(null)} />
                        <MobilePreview flow={selectedFlow} />
                    </Stack>
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 0.5 }}>
                <Grid item xs={12} md={4}>
                    <VersionHistory flow={selectedFlow} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 4, p: 2.25, boxShadow: "0 18px 50px rgba(15,23,42,0.08)", height: "100%" }}>
                        <Typography variant="subtitle1" fontWeight={800}>Recent Activity</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Live updates and publication history.</Typography>
                        <Stack spacing={1.25}>
                            {(selectedFlow?.recentActivity || []).map((activity) => (
                                <Box key={activity.id} sx={{ border: 1, borderColor: "divider", borderRadius: 3, p: 1.25 }}>
                                    <Typography variant="body2" fontWeight={700}>{activity.title}</Typography>
                                    <Typography variant="caption" color="text.secondary">{activity.time}</Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <FlowAnalytics flow={selectedFlow} />
                </Grid>
            </Grid>

            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Flow</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            label="Flow Name"
                            value={newFlowDraft.name}
                            onChange={(event) => setNewFlowDraft((prev) => ({ ...prev, name: event.target.value }))}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Hospital"
                            value={newFlowDraft.hospital}
                            onChange={(event) => setNewFlowDraft((prev) => ({ ...prev, hospital: event.target.value }))}
                            fullWidth
                            select
                        >
                            <MenuItem value="Jindal Hospital">Jindal Hospital</MenuItem>
                            <MenuItem value="Metro Care Hospital">Metro Care Hospital</MenuItem>
                            <MenuItem value="Saraswati Hospital">Saraswati Hospital</MenuItem>
                            <MenuItem value="Apex Medical Center">Apex Medical Center</MenuItem>
                        </TextField>
                        <TextField
                            label="Branch"
                            value={newFlowDraft.branch}
                            onChange={(event) => setNewFlowDraft((prev) => ({ ...prev, branch: event.target.value }))}
                            fullWidth
                            select
                        >
                            <MenuItem value="Cardiology">Cardiology</MenuItem>
                            <MenuItem value="General OPD">General OPD</MenuItem>
                            <MenuItem value="Billing Desk">Billing Desk</MenuItem>
                            <MenuItem value="Emergency">Emergency</MenuItem>
                        </TextField>
                        <TextField
                            label="Created By"
                            value={newFlowDraft.createdBy}
                            onChange={(event) => setNewFlowDraft((prev) => ({ ...prev, createdBy: event.target.value }))}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateFlow}>Create Flow</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default WhatsAppFlowBuilder;
