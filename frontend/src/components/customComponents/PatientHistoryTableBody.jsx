import React, { useState } from "react";
import moment from "moment";
import {
    TableRow,
    TableCell,
    Link,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    Rating,
    Typography,
    Box,
    Divider,
    CircularProgress,
    IconButton,

} from "@mui/material";
import { getNestedValue } from "../../utils/exportUtils";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useCallback } from "react";


export const FormStatus = {
    PENDING: "PENDING",
    ARCHIVED: "ARCHIVED",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    ERRORFORM: "ERRORFORM",
}
const ExpandableText = ({ text = "", limit = 60 }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!text || text.length <= limit) {
        return <Typography variant="body2">{text || "-"}</Typography>;
    }

    const truncatedText = text.substring(0, limit) + "...";

    return (
        <Typography variant="body2" component="span">
            {isExpanded ? text : truncatedText}{" "}
            <Button
                size="small"
                onClick={() => setIsExpanded(!isExpanded)}
                sx={{
                    padding: 0,
                    minWidth: "auto",
                    fontSize: "12px",
                    textTransform: "none",
                    fontWeight: "bold",
                    marginLeft: "4px",
                }}
            >
                {isExpanded ? "less" : "more"}
            </Button>
        </Typography>
    );
};


// --- Component 1: Ratings Popup Modal ---
export const RatingsDialog = ({ open, questions, onClose }) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ m: 0, p: 2, fontWeight: "bold" }}>
                Question Ratings
            </DialogTitle>
            <DialogContent dividers>
                <List disablePadding>
                    {questions?.map((q, index) => (
                        <React.Fragment key={q.questionId || index}>
                            <ListItem alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle2" color="text.primary" sx={{ mb: 0.5 }}>
                                            {q.questionText}
                                        </Typography>
                                    }
                                    secondary={
                                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                            <Rating
                                                value={q.rating}
                                                readOnly
                                                precision={0.5}
                                                size="small"
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                ({q.rating} / 5)
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                            {index < questions.length - 1 && <Divider component="li" />}
                        </React.Fragment>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained" color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};


const getFormattedCellValue = (key, col, row, rawValue) => {
    let displayValue = rawValue;

    // 1. Format Appointment Slot
    if (key === "formData.appointmentSlot") {
        if (displayValue && typeof displayValue === "object") {
            const formattedDate = displayValue?.date
                ? moment(displayValue.date).format("dddd, DD MMM YYYY")
                : null;
            const timeRange = `${displayValue?.start || "N/A"} to ${displayValue?.end || "N/A"}`;
            return formattedDate ? `${formattedDate} | ${timeRange}` : timeRange;
        }

        if (col?.value === "Appointment") {
            const formattedDate = row?.dateTime
                ? moment(row.dateTime).format("dddd, DD MMM YYYY")
                : null;
            const arrival = `Arrival Time: ${row?.patientArrivalTime || "-"}`;
            return formattedDate ? `${formattedDate} | ${arrival}` : arrival;
        }

        return "-";
    }

    // 2. Format Created At Date
    if (key === "createdAt" && displayValue && moment(displayValue).isValid()) {
        return moment(displayValue).format("DD MMM YYYY, hh:mm A");
    }

    // 3. Format Date Objects
    if (displayValue instanceof Date) {
        return moment(displayValue).format("DD/MM/YYYY hh:mm A");
    }

    // 4. Object & Nullish fallbacks
    if (typeof displayValue === "object" && displayValue !== null) {
        return "-";
    }

    return displayValue ?? "-";
};

const TableMessageRow = React.memo(({ colSpan, children }) => (
    <tr>
        <td colSpan={colSpan} style={{ textAlign: "center", padding: "16px" }}>
            {children}
        </td>
    </tr>
));

export const PatientHistoryRow = React.memo(({
    row,
    columns,
    patientProfile,
    onViewRatings,
    showAction = false,
    editRowId
}) => {
    // Derive status directly to avoid side-effect state setter in render loop
    const status = row?.formStatus || "";

    // Memoize static mappings relative to patientProfile
    const fieldMap = useMemo(() => ({
        "formData.patientDetails.patientName": patientProfile?.patientName,
        "formData.patientDetails.patientMobile": patientProfile?.patientMobile,
        "formData.patientDetails.status": patientProfile?.status,
        "formData.patientDetails.patientAge": patientProfile?.patientAge,
        "formData.patientDetails.category": patientProfile?.category,
        "formData.patientDetails.location": patientProfile?.location,
        "formData.patientDetails.gender": patientProfile?.gender,
    }), [patientProfile]);

    const handleEditClick = useCallback(() => {
        editRowId?.(row);
    }, [editRowId, row]);

    return (
        <TableRow>
            {showAction && (
                <TableCell align="center">
                    {status ? (
                        status
                    ) : (
                        <IconButton
                            size="small"
                            onClick={handleEditClick}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    )}
                    {/* <IconButton
                        size="small"
                        onClick={handleEditClick}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton> */}
                </TableCell>
            )}

            {columns.map((col, colIndex) => {
                const key = col?.key;
                const cellKey = col?.id || col?.key || colIndex;

                // Case 1: Feedback Questions Rating Link
                if (key === "formData.feedback.questions") {
                    const questions = getNestedValue(row, key) || [];
                    if (Array.isArray(questions) && questions.length > 0) {
                        return (
                            <TableCell key={cellKey}>
                                <Link
                                    component="button"
                                    variant="body2"
                                    underline="hover"
                                    sx={{ fontWeight: "medium", cursor: "pointer" }}
                                    onClick={() => onViewRatings?.(questions)}
                                >
                                    View Rating
                                </Link>
                            </TableCell>
                        );
                    }
                }

                const rawValue = fieldMap[key] ?? getNestedValue(row, key);

                // Case 2: Remarks with expandable text
                if (key === "formData.remarks") {
                    return (
                        <TableCell key={cellKey} sx={{ maxWidth: 250 }}>
                            <ExpandableText text={rawValue} limit={60} />
                        </TableCell>
                    );
                }

                // Case 3: Standard cell values & fallbacks
                const displayValue = getFormattedCellValue(key, col, row, rawValue);

                return (
                    <TableCell key={cellKey}>
                        {displayValue}
                    </TableCell>
                );
            })}
        </TableRow>
    );
});
// --- Component 3: Main Table Body ---
export function PatientHistoryTableBody({
    columns = [],
    filteredLatestVisits = [],
    patientProfile = {},
    isLoading = false,
    showAction = false,
    editRowId
}) {
    // console.log("filteredLatestVisits", filteredLatestVisits);

    const [selectedQuestions, setSelectedQuestions] = useState(null);
    const colSpan = columns.length;

    if (isLoading) {
        return (
            <tbody>
                <TableMessageRow colSpan={colSpan}>
                    <CircularProgress size={24} />
                </TableMessageRow>
            </tbody>
        );
    }

    if (!filteredLatestVisits?.length) {
        return (
            <tbody>
                <TableMessageRow colSpan={colSpan}>
                    No matching visit records found.
                </TableMessageRow>
            </tbody>
        );
    }

    return (
        <tbody>
            {filteredLatestVisits.map((lv, rowIndex) => (
                <PatientHistoryRow
                    key={lv?._id ?? `row-${rowIndex}`}
                    row={lv}
                    columns={columns}
                    showAction={showAction}
                    patientProfile={patientProfile}
                    editRowId={editRowId}
                    onViewRatings={(questions) => setSelectedQuestions(questions)}
                />
            ))}

            {/* Ratings Modal render once for the body */}
            <RatingsDialog
                open={Boolean(selectedQuestions)}
                questions={selectedQuestions}
                onClose={() => setSelectedQuestions(null)}
            />
        </tbody>
    );
}