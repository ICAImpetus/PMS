import { useState } from "react";
import {
    Box,
    Button,
    Card,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

const NodeConfigurationPanel = ({ node, onCancel }) => {
    const [form, setForm] = useState(node || {});

    if (!node) {
        return (
            <Card sx={{ borderRadius: 4, p: 3, boxShadow: "0 18px 50px rgba(15,23,42,0.08)", height: "100%" }}>
                <Typography variant="h6" fontWeight={700}>Node Configuration</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Select a node on the canvas to edit its behavior and content.
                </Typography>
            </Card>
        );
    }

    return (
        <Card sx={{ borderRadius: 4, p: 2.5, boxShadow: "0 18px 50px rgba(15,23,42,0.08)", height: "100%" }}>
            <Typography variant="h6" fontWeight={800}>Node Configuration</Typography>
            <Typography variant="caption" color="text.secondary">{node.type}</Typography>

            <Stack spacing={1.5} sx={{ mt: 2 }}>
                <TextField label="Node Name" value={form.name || ""} onChange={(event) => setForm({ ...form, name: event.target.value })} fullWidth size="small" />
                <TextField label="Message Content" value={form.messageContent || ""} onChange={(event) => setForm({ ...form, messageContent: event.target.value })} fullWidth size="small" multiline minRows={3} />
                <TextField label="Header Text" value={form.headerText || ""} onChange={(event) => setForm({ ...form, headerText: event.target.value })} fullWidth size="small" />
                <TextField label="Footer Text" value={form.footerText || ""} onChange={(event) => setForm({ ...form, footerText: event.target.value })} fullWidth size="small" />
                <TextField label="Dynamic Variables" value={form.dynamicVariables || ""} onChange={(event) => setForm({ ...form, dynamicVariables: event.target.value })} fullWidth size="small" />
                <TextField label="Quick Reply Buttons" value={(form.quickReplies || []).join(", ")} onChange={(event) => setForm({ ...form, quickReplies: event.target.value.split(",") })} fullWidth size="small" />
                <TextField label="List Options" value={(form.listOptions || []).join(", ")} onChange={(event) => setForm({ ...form, listOptions: event.target.value.split(",") })} fullWidth size="small" />
                <TextField label="Validation Rules" value={form.validationRules || ""} onChange={(event) => setForm({ ...form, validationRules: event.target.value })} fullWidth size="small" />
                <TextField label="Retry Count" type="number" value={form.retryCount || 0} onChange={(event) => setForm({ ...form, retryCount: Number(event.target.value) })} fullWidth size="small" />
                <TextField label="Timeout Settings" type="number" value={form.timeoutSeconds || 0} onChange={(event) => setForm({ ...form, timeoutSeconds: Number(event.target.value) })} fullWidth size="small" />
                <TextField label="API URL" value={form.apiUrl || ""} onChange={(event) => setForm({ ...form, apiUrl: event.target.value })} fullWidth size="small" disabled />
                <FormControl size="small">
                    <InputLabel>HTTP Method</InputLabel>
                    <TextField select label="HTTP Method" value={form.httpMethod || "GET"} onChange={(event) => setForm({ ...form, httpMethod: event.target.value })} fullWidth size="small">
                        <MenuItem value="GET">GET</MenuItem>
                        <MenuItem value="POST">POST</MenuItem>
                        <MenuItem value="PUT">PUT</MenuItem>
                    </TextField>
                </FormControl>
                <TextField label="JSON Payload" value={form.jsonPayload || "{}"} onChange={(event) => setForm({ ...form, jsonPayload: event.target.value })} fullWidth multiline minRows={3} size="small" />
                <TextField label="Variable Mapping" value={form.variableMapping || ""} onChange={(event) => setForm({ ...form, variableMapping: event.target.value })} fullWidth size="small" />
                <TextField label="Error Handling" value={form.errorHandling || ""} onChange={(event) => setForm({ ...form, errorHandling: event.target.value })} fullWidth size="small" />
                <TextField label="Success Path" value={form.successPath || ""} onChange={(event) => setForm({ ...form, successPath: event.target.value })} fullWidth size="small" />
                <TextField label="Failure Path" value={form.failurePath || ""} onChange={(event) => setForm({ ...form, failurePath: event.target.value })} fullWidth size="small" />
                <TextField label="Node Notes" value={form.notes || ""} onChange={(event) => setForm({ ...form, notes: event.target.value })} fullWidth multiline minRows={2} size="small" />
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={1.25} justifyContent="flex-end">
                <Button variant="outlined" onClick={onCancel}>Cancel</Button>
                <Button variant="contained">Save Node</Button>
            </Stack>
        </Card>
    );
};

export default NodeConfigurationPanel;
