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


const TableMessageRow = React.memo(({ colSpan, children }) => (
    <tr>
        <td colSpan={colSpan} style={{ textAlign: "center", padding: "16px" }}>
            {children}
        </td>
    </tr>
));

{
    showAction && (
        <TableCell align="center">
            <IconButton size="small" onClick={() => handleEditForm?.(row)}>
                <EditIcon fontSize="small" />
            </IconButton>
        </TableCell>
    )
}
{
    columns.map((col, colIndex) => {
        const key = col?.key;

        // 1. Feedback Questions Rating Link
        if (key === "formData.feedback.questions") {
            const questions = getNestedValue(row, key) || [];
            if (Array.isArray(questions) && questions.length > 0) {
                return (
                    <TableCell key={col?.id || colIndex}>
                        <Link
                            component="button"
                            variant="body2"
                            underline="hover"
                            sx={{ fontWeight: "medium", cursor: "pointer" }}
                            onClick={() => onViewRatings(questions)}
                        >
                            View Rating
                        </Link>
                    </TableCell>
                );
            }
        }

        // 2. Resolve field value
        const rawValue = fieldMap[key] ?? getNestedValue(row, key);
        let displayValue = rawValue;

        // 3. Format Appointment Slot
        if (key === "formData.appointmentSlot") {
            if (displayValue && typeof displayValue === "object") {
                const formattedDate = displayValue?.date
                    ? moment(displayValue.date).format("dddd, DD MMM YYYY")
                    : null;

                const timeRange = `${displayValue?.start || "N/A"} to ${displayValue?.end || "N/A"}`;
                displayValue = formattedDate ? `${formattedDate} | ${timeRange}` : timeRange;
            } else if (col?.value === "Appointment") {
                const formattedDate = row?.dateTime
                    ? moment(row.dateTime).format("dddd, DD MMM YYYY")
                    : null;

                const arrival = `Arrival Time: ${row?.patientArrivalTime || "-"}`;
                displayValue = formattedDate ? `${formattedDate} | ${arrival}` : arrival;
            } else {
                displayValue = "-";
            }
        }
        // 4. Format Created At Date
        else if (key === "createdAt" && displayValue && moment(displayValue).isValid()) {
            displayValue = moment(displayValue).format("DD MMM YYYY, hh:mm A");
        }
        // 5. Format Date Objects
        else if (displayValue instanceof Date) {
            displayValue = moment(displayValue).format("DD/MM/YYYY hh:mm A");
        }
        // 6. Object & Nullish fallbacks
        else if (typeof displayValue === "object" && displayValue !== null) {
            displayValue = "-";
        } else {
            displayValue = displayValue ?? "-";
        }

        return (
            <TableCell key={col?.id || colIndex}>
                {displayValue}
            </TableCell>
        );
    })
}




export const PatientHistoryRow = ({
    row,
    columns,
    patientProfile,
    onViewRatings,
    showAction = false,
    editRowId

}) => {

    const fieldMap = {
        "formData.patientDetails.patientName": patientProfile?.patientName,
        "formData.patientDetails.patientMobile": patientProfile?.patientMobile,
        "formData.patientDetails.status": patientProfile?.status,
        "formData.patientDetails.patientAge": patientProfile?.patientAge,
        "formData.patientDetails.category": patientProfile?.category,
        "formData.patientDetails.location": patientProfile?.location,
        "formData.patientDetails.gender": patientProfile?.gender,
    };



    return (

        <TableRow>

            {showAction && (
                <TableCell align="center">
                    <IconButton size="small" onClick={() => editRowId?.(row)}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                </TableCell>
            )}
            {columns.map((col, colIndex) => {
                const key = col?.key;

                // 1. Feedback Questions Rating Link
                if (key === "formData.feedback.questions") {
                    const questions = getNestedValue(row, key) || [];
                    if (Array.isArray(questions) && questions.length > 0) {
                        return (
                            <TableCell key={col?.id || colIndex}>
                                <Link
                                    component="button"
                                    variant="body2"
                                    underline="hover"
                                    sx={{ fontWeight: "medium", cursor: "pointer" }}
                                    onClick={() => onViewRatings(questions)}
                                >
                                    View Rating
                                </Link>
                            </TableCell>
                        );
                    }
                }

                // 2. Resolve field value
                const rawValue = fieldMap[key] ?? getNestedValue(row, key);
                let displayValue = rawValue;

                // 3. Format Appointment Slot
                if (key === "formData.appointmentSlot") {
                    if (displayValue && typeof displayValue === "object") {
                        const formattedDate = displayValue?.date
                            ? moment(displayValue.date).format("dddd, DD MMM YYYY")
                            : null;

                        const timeRange = `${displayValue?.start || "N/A"} to ${displayValue?.end || "N/A"}`;
                        displayValue = formattedDate ? `${formattedDate} | ${timeRange}` : timeRange;
                    } else if (col?.value === "Appointment") {
                        const formattedDate = row?.dateTime
                            ? moment(row.dateTime).format("dddd, DD MMM YYYY")
                            : null;

                        const arrival = `Arrival Time: ${row?.patientArrivalTime || "-"}`;
                        displayValue = formattedDate ? `${formattedDate} | ${arrival}` : arrival;
                    } else {
                        displayValue = "-";
                    }
                }
                // 4. Format Created At Date
                else if (key === "createdAt" && displayValue && moment(displayValue).isValid()) {
                    displayValue = moment(displayValue).format("DD MMM YYYY, hh:mm A");
                }
                // 5. Format Date Objects
                else if (displayValue instanceof Date) {
                    displayValue = moment(displayValue).format("DD/MM/YYYY hh:mm A");
                }
                // 6. Object & Nullish fallbacks
                else if (typeof displayValue === "object" && displayValue !== null) {
                    displayValue = "-";
                } else {
                    displayValue = displayValue ?? "-";
                }

                return (
                    <TableCell key={col?.id || colIndex}>
                        {displayValue}
                    </TableCell>
                );
            })}
        </TableRow>
    );
};

// --- Component 3: Main Table Body ---
export function PatientHistoryTableBody({
    columns = [],
    filteredLatestVisits = [],
    patientProfile = {},
    isLoading = false,
    showAction = false,
    editRowId
}) {
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