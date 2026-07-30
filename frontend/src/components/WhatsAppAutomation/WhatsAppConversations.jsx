import { useMemo, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Divider,
    Grid,
    IconButton,
    Paper,
    Stack,
    Typography,
    Skeleton,
    Alert,
} from "@mui/material";
import {
    RefreshRounded,
    DownloadRounded,
    FilterListRounded,
    AddRounded,
    MessageRounded,
    SearchOffRounded,
    ErrorOutlineRounded,
} from "@mui/icons-material";
import ConversationStats from "./ConversationStats";
import ConversationFilters from "./ConversationFilters";
import ConversationSidebar from "./ConversationSidebar";
import ChatWindow from "./ChatWindow";
import PatientDetailsDrawer from "./PatientDetailsDrawer";
import { dummyWhatsappConversations, conversationStats, filterOptions } from "./dummyWhatsappConversations";

const initialFilters = {
    search: "",
    hospital: "All Hospitals",
    branch: "All Branches",
    department: "All Departments",
    doctor: "All Doctors",
    status: "All Status",
    dateRange: "",
    executive: "All Executives",
    messageType: "All Types",
};

const WhatsAppConversations = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [conversations, setConversations] = useState(dummyWhatsappConversations);
    const [selectedConversationId, setSelectedConversationId] = useState(dummyWhatsappConversations[0]?.id);
    const [filters, setFilters] = useState(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState(initialFilters);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(3);

    const filteredConversations = useMemo(() => {
        const query = appliedFilters.search.trim().toLowerCase();
        return conversations.filter((conversation) => {
            const patient = conversation.patient;
            const matchesSearch =
                !query ||
                patient.name.toLowerCase().includes(query) ||
                patient.mobile.toLowerCase().includes(query) ||
                patient.uhid.toLowerCase().includes(query);
            const matchesHospital = appliedFilters.hospital === "All Hospitals" || conversation.hospital === appliedFilters.hospital;
            const matchesBranch = appliedFilters.branch === "All Branches" || conversation.branch === appliedFilters.branch;
            const matchesDepartment = appliedFilters.department === "All Departments" || conversation.department === appliedFilters.department;
            const matchesDoctor = appliedFilters.doctor === "All Doctors" || conversation.doctor === appliedFilters.doctor;
            const matchesStatus = appliedFilters.status === "All Status" || conversation.status === appliedFilters.status;
            const matchesMessageType = appliedFilters.messageType === "All Types" || conversation.messages.some((message) => {
                const normalizedType = (message.type || "text").toLowerCase();
                return normalizedType === appliedFilters.messageType.toLowerCase();
            });
            return matchesSearch && matchesHospital && matchesBranch && matchesDepartment && matchesDoctor && matchesStatus && matchesMessageType;
        });
    }, [appliedFilters, conversations]);

    const selectedConversation = useMemo(() => {
        return filteredConversations.find((item) => item.id === selectedConversationId) || filteredConversations[0] || null;
    }, [filteredConversations, selectedConversationId]);

    const paginatedConversations = useMemo(() => {
        const start = page * rowsPerPage;
        return filteredConversations.slice(start, start + rowsPerPage);
    }, [filteredConversations, page, rowsPerPage]);

    const handleFilterChange = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        setPage(0);
        setAppliedFilters(filters);
    };

    const resetFilters = () => {
        setFilters(initialFilters);
        setAppliedFilters(initialFilters);
        setPage(0);
    };

    const retryLoad = () => {
        setLoading(true);
        setError(false);
        setTimeout(() => {
            setConversations(dummyWhatsappConversations);
            setSelectedConversationId(dummyWhatsappConversations[0]?.id);
            setLoading(false);
        }, 600);
    };

    const handleTransferToHuman = () => {
        setConversations((prev) => prev.map((item) => (item.id === selectedConversation?.id ? { ...item, status: "Human Handling" } : item)));
    };

    const handleCloseConversation = () => {
        setConversations((prev) => prev.map((item) => (item.id === selectedConversation?.id ? { ...item, status: "Closed" } : item)));
    };

    const renderLoadingState = () => (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Card sx={{ borderRadius: 4, p: 2, mb: 3 }}>
                <Skeleton variant="text" width="40%" height={36} />
                <Skeleton variant="text" width="65%" height={24} sx={{ mt: 0.75 }} />
            </Card>
            <ConversationStats stats={conversationStats} />
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 4 }} />
                </Grid>
                <Grid item xs={12} md={8}>
                    <Skeleton variant="rectangular" height={520} sx={{ borderRadius: 4 }} />
                </Grid>
            </Grid>
        </Container>
    );

    const renderEmptyState = () => (
        <Box sx={{ p: 4, textAlign: "center", borderRadius: 4, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
            <SearchOffRounded sx={{ fontSize: 54, color: "text.secondary", mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>
                No Conversations Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: "auto" }}>
                Try relaxing the filters or resetting them to view the full conversation queue.
            </Typography>
        </Box>
    );

    if (loading) return renderLoadingState();

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Card sx={{ borderRadius: 4, boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
                <Box sx={{ p: { xs: 2.4, md: 3.2 }, bgcolor: "linear-gradient(135deg, #f8fbff 0%, #f9f5ff 100%)" }}>
                    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2}>
                        <Box>
                            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 0.75 }}>
                                <MessageRounded color="primary" sx={{ fontSize: 28 }} />
                                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                                    WhatsApp Conversations
                                </Typography>
                            </Stack>
                            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760 }}>
                                Monitor patient conversations between the WhatsApp AI Assistant and hospital executives in one premium workspace designed for modern care teams.
                            </Typography>
                        </Box>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                            <Button variant="outlined" startIcon={<RefreshRounded />} onClick={retryLoad}>
                                Refresh
                            </Button>
                            <Button variant="outlined" startIcon={<DownloadRounded />}>
                                Export
                            </Button>
                            <Button variant="outlined" startIcon={<FilterListRounded />}>
                                Filters
                            </Button>
                            <Button variant="contained" startIcon={<AddRounded />} disabled>
                                New Conversation
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Card>

            {error && (
                <Alert severity="error" sx={{ my: 2 }} action={<Button color="inherit" size="small" onClick={retryLoad}>Retry</Button>}>
                    We could not load live conversation data. Showing the local demo experience instead.
                </Alert>
            )}

            <Box sx={{ mt: 3 }}>
                <ConversationStats stats={conversationStats} />
            </Box>

            <ConversationFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onApply={applyFilters}
                onReset={resetFilters}
                options={filterOptions}
            />

            <Grid container spacing={3}>
                <Grid item xs={12} lg={4}>
                    <ConversationSidebar
                        conversations={paginatedConversations}
                        selectedConversationId={selectedConversationId}
                        onSelectConversation={setSelectedConversationId}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={(nextPage) => setPage(nextPage)}
                        onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(0); }}
                        totalCount={filteredConversations.length}
                    />
                </Grid>

                <Grid item xs={12} lg={8}>
                    {selectedConversation ? (
                        <ChatWindow
                            conversation={selectedConversation}
                            onOpenPatientDrawer={() => setDrawerOpen(true)}
                            onTransferToHuman={handleTransferToHuman}
                            onCloseConversation={handleCloseConversation}
                        />
                    ) : (
                        renderEmptyState()
                    )}
                </Grid>
            </Grid>

            <PatientDetailsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} patient={selectedConversation?.patient} />
        </Container>
    );
};

export default WhatsAppConversations;
