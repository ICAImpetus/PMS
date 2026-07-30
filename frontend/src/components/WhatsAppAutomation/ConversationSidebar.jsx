import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { ForumOutlined } from "@mui/icons-material";
import ConversationCard from "./ConversationCard";

const ConversationSidebar = ({ conversations, selectedConversationId, onSelectConversation, page, rowsPerPage, onPageChange, onRowsPerPageChange, totalCount }) => {
    const start = totalCount === 0 ? 0 : page * rowsPerPage + 1;
    const end = Math.min((page + 1) * rowsPerPage, totalCount);

    return (
        <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
            <Box sx={{ p: 2.2, bgcolor: "background.default" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={1} alignItems="center">
                        <ForumOutlined color="primary" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            Conversations
                        </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                        {start}-{end} of {totalCount}
                    </Typography>
                </Stack>
            </Box>
            <Divider />

            <Box sx={{ p: 1.25, maxHeight: 760, overflowY: "auto" }}>
                {conversations.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                            No conversations match the current filters.
                        </Typography>
                    </Box>
                ) : (
                    conversations.map((conversation) => (
                        <ConversationCard
                            key={conversation.id}
                            conversation={conversation}
                            selected={conversation.id === selectedConversationId}
                            onSelect={() => onSelectConversation(conversation.id)}
                        />
                    ))
                )}
            </Box>

            <Divider />
            <Box sx={{ p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "background.paper" }}>
                <Typography variant="caption" color="text.secondary">
                    Rows per page
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <select
                        value={rowsPerPage}
                        onChange={(event) => onRowsPerPageChange(Number(event.target.value))}
                        style={{ borderRadius: 8, border: "1px solid #d1d5db", padding: "6px 8px", background: "white" }}
                    >
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={5}>5</option>
                    </select>
                    <Typography variant="caption" color="text.secondary">Page {page + 1}</Typography>
                    <button onClick={() => onPageChange(page - 1)} disabled={page === 0} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #d1d5db" }}>
                        Prev
                    </button>
                    <button onClick={() => onPageChange(page + 1)} disabled={(page + 1) * rowsPerPage >= totalCount} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #d1d5db" }}>
                        Next
                    </button>
                </Stack>
            </Box>
        </Paper>
    );
};

export default ConversationSidebar;
