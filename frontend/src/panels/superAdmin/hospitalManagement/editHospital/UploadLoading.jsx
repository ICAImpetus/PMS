// ProgressPopup.jsx

import {
    Dialog,
    DialogContent,
    Typography,
    LinearProgress,
    Button
} from "@mui/material";
import { useState } from "react";


export const SpecialtiesCell = ({ specialties = [] }) => {
    const [expanded, setExpanded] = useState(false);

    if (!Array.isArray(specialties) || specialties.length === 0) return null;

    const visibleItems = expanded ? specialties : specialties.slice(0, 2);

    return (
        <>
            {visibleItems.map((s) => s.value).join(", ")}

            {specialties.length > 2 && (
                <Button
                    size="small"
                    onClick={() => setExpanded(!expanded)}
                    sx={{ ml: 1, textTransform: "none" }}
                >
                    {expanded ? "Less" : `+${specialties.length - 2} more`}
                </Button>
            )}
        </>
    );
};

const ProgressPopup = ({ open, progress, title = "Uploading..." }) => {
    return (
        <Dialog open={open}>
            <DialogContent style={{ width: 300, textAlign: "center" }}>
                <Typography variant="h6">{title}</Typography>

                <LinearProgress
                    variant="determinate"
                    value={progress}
                    style={{ marginTop: 20 }}
                />

                <Typography style={{ marginTop: 10 }}>
                    {progress}%
                </Typography>
            </DialogContent>
        </Dialog>
    );
};

export default ProgressPopup;