import { useMemo, useState } from "react";
import { Box, Card, Divider, Stack, Typography } from "@mui/material";
import ArrowRightAltRounded from "@mui/icons-material/ArrowRightAltRounded";
import FlowNode from "./FlowNode";

const FlowCanvas = ({ flow, selectedNode, onSelectNode }) => {
    const [hoveredNode, setHoveredNode] = useState(null);

    const nodes = useMemo(() => flow?.nodes || [], [flow]);

    return (
        <Card sx={{ borderRadius: 4, overflow: "hidden", boxShadow: "0 18px 50px rgba(15,23,42,0.08)", height: "100%" }}>
            <Box sx={{ p: 2.25, borderBottom: 1, borderColor: "divider" }}>
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={800}>Flow Canvas</Typography>
                        <Typography variant="caption" color="text.secondary">Drag-inspired visual builder for patient journeys</Typography>
                    </Box>
                    <Typography variant="caption" color="primary.main" fontWeight={700}>
                        {flow?.name || "Select a flow"}
                    </Typography>
                </Stack>
            </Box>

            <Box sx={{ p: 2.25, minHeight: 420, bgcolor: "linear-gradient(135deg, #f8fbff 0%, #f9f5ff 100%)", overflowX: "auto" }}>
                {nodes.length === 0 ? (
                    <Box sx={{ border: "1px dashed", borderColor: "divider", borderRadius: 4, p: 3, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">This flow is empty. Add a node to begin.</Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, minWidth: 1100 }}>
                        {nodes.map((node, index) => (
                            <Box key={node.id} sx={{ display: "flex", alignItems: "center" }}>
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Box
                                        onMouseEnter={() => setHoveredNode(node.id)}
                                        onMouseLeave={() => setHoveredNode(null)}
                                        sx={{ position: "relative" }}
                                    >
                                        <FlowNode node={node} selected={selectedNode?.id === node.id} onSelect={onSelectNode} />
                                        {hoveredNode === node.id && (
                                            <Box sx={{ position: "absolute", top: -8, right: -8, width: 12, height: 12, borderRadius: "50%", bgcolor: "primary.main" }} />
                                        )}
                                    </Box>
                                    {index < nodes.length - 1 && (
                                        <Box sx={{ my: 1, color: "primary.main", display: "flex", alignItems: "center" }}>
                                            <ArrowRightAltRounded />
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>

            <Divider />
            <Box sx={{ p: 2, bgcolor: "background.paper" }}>
                <Typography variant="body2" color="text.secondary">Tip: select any node to configure its message, validation rules, and routing logic.</Typography>
            </Box>
        </Card>
    );
};

export default FlowCanvas;
