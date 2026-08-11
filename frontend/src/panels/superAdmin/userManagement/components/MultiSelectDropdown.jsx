import React from "react";
import {
    Box,
    MenuItem,
    Chip,
    FormControl,
    Select,
    Checkbox,
    ListItemText,
    Typography,
    Divider,
    InputLabel,
    OutlinedInput,
    Paper,
    FormHelperText,
} from "@mui/material";

const MultiSelectDropdown = ({
    options = [],
    selectedOptions = [],
    setSelectedOptions,
    label = "Select Options",
    role,
    currentId = null,
    isSingleSelect = false,
    error = false,
    helperText = "",
}) => {
    // Disabled logic
    const getDisabledState = (option) => {
        const assignmentFieldMap = {
            supermanager: "assignedToManager",
            teamleader: "assignedToTeamLeader",
            executive: "assignedToExecutive",
        };

        const fieldName = assignmentFieldMap[role?.toLowerCase()];
        const assignedData = fieldName ? option[fieldName] : null;

        let isAssigned = false;
        let assignedNames = [];

        if (role?.toLowerCase() === "executive") {
            if (Array.isArray(assignedData)) {
                assignedNames = assignedData.map((user) =>
                    typeof user === "object" ? user?.name : ""
                );
            }
            isAssigned = false;
        } else if (assignedData) {
            const assignedId =
                typeof assignedData === "object" ? assignedData?._id : assignedData;

            if (assignedId && currentId && String(assignedId) === String(currentId)) {
                isAssigned = false;
            } else {
                isAssigned = true;
            }

            assignedNames = [
                typeof assignedData === "object" ? assignedData?.name : "",
            ];
        }

        return { isAssigned, assignedNames };
    };

    const selectableOptions = options.filter(
        (opt) => !getDisabledState(opt).isAssigned
    );

    // All selectable options are selected
    const allSelected =
        selectableOptions.length > 0 &&
        selectableOptions.every((opt) =>
            selectedOptions.some((sel) => String(sel?._id) === String(opt?._id))
        );

    // Some but not all selectable options are selected
    const someSelected = selectableOptions.some((opt) =>
        selectedOptions.some((sel) => String(sel?._id) === String(opt?._id))
    );

    // HANDLE CHANGE
    const handleChange = (event) => {
        const value = event.target.value;

        // SINGLE SELECT
        if (isSingleSelect) {
            const selectedObj = options.find(
                (opt) => String(opt._id) === String(value)
            );
            setSelectedOptions(
                selectedObj
                    ? [{ _id: selectedObj._id, name: selectedObj.name }]
                    : []
            );
            return;
        }

        // MULTI SELECT
        if (value.includes("select-all")) {
            if (allSelected) {
                // remove all selectable
                const remaining = selectedOptions.filter(
                    (sel) =>
                        !selectableOptions.some(
                            (opt) => String(opt._id) === String(sel._id)
                        )
                );
                setSelectedOptions(remaining);
            } else {
                // add all selectable
                const merged = [
                    ...selectedOptions,
                    ...selectableOptions
                        .filter(
                            (opt) =>
                                !selectedOptions.some(
                                    (sel) => String(sel._id) === String(opt._id)
                                )
                        )
                        .map((opt) => ({
                            _id: opt._id,
                            name: opt.name,
                        })),
                ];
                setSelectedOptions(merged);
            }
            return;
        }

        // Normal multi select
        const selectedObjects = value
            .map((id) => {
                const fullObj = options.find(
                    (opt) => String(opt._id) === String(id)
                );
                return fullObj ? { _id: fullObj._id, name: fullObj.name } : null;
            })
            .filter(Boolean);

        setSelectedOptions(selectedObjects);
    };

    const handleDelete = (id) => {
        setSelectedOptions(
            selectedOptions.filter((item) => String(item._id) !== String(id))
        );
    };

    // RENDER VALUE
    const renderValue = (selectedIds) => {
        if (isSingleSelect) {
            const selectedObj = options.find(
                (opt) => String(opt._id) === String(selectedIds)
            );
            return (
                <Typography variant="body2" fontWeight={600} color="#0F172A">
                    {selectedObj?.name || ""}
                </Typography>
            );
        }

        const selected = options.filter((opt) =>
            selectedIds.includes(String(opt._id))
        );

        if (selected.length === 0) {
            return (
                <Typography variant="body2" color="#94A3B8" fontSize="13px">
                    {label}
                </Typography>
            );
        }

        return (
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "nowrap",
                    gap: 0.8,
                    overflowX: "auto",
                    alignItems: "center",
                    py: 0.2,
                    "&::-webkit-scrollbar": { display: "none" },
                }}
            >
                {selected.slice(0, 3).map((option) => (
                    <Chip
                        key={String(option._id)}
                        label={option.name}
                        size="small"
                        onDelete={(e) => {
                            e.stopPropagation();
                            handleDelete(option._id);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        sx={{
                            bgcolor: "#EFF6FF",
                            color: "#0256E8",
                            fontWeight: 700,
                            fontSize: "11px",
                            borderRadius: "8px",
                            border: "1px solid #BFDBFE",
                            height: "24px",
                            "& .MuiChip-deleteIcon": {
                                color: "#3B82F6",
                                fontSize: "14px",
                                "&:hover": {
                                    color: "#1D4ED8",
                                },
                            },
                        }}
                    />
                ))}

                {selected.length > 3 && (
                    <Chip
                        label={`+${selected.length - 3}`}
                        size="small"
                        sx={{
                            bgcolor: "#F1F5F9",
                            color: "#475569",
                            fontWeight: 800,
                            fontSize: "10px",
                            borderRadius: "8px",
                            height: "24px",
                        }}
                    />
                )}
            </Box>
        );
    };

    return (
        <Box sx={{ width: "100%" }}>
            <FormControl fullWidth size="small" error={Boolean(error)}>
                <InputLabel
                    sx={{
                        fontSize: "13px",
                        color: error ? "#EF4444" : "#64748B",
                        "&.Mui-focused": { color: error ? "#EF4444" : "#0256E8" },
                    }}
                >
                    {label}
                </InputLabel>

                <Select
                    multiple={!isSingleSelect}
                    value={
                        isSingleSelect
                            ? selectedOptions[0]?._id || ""
                            : selectedOptions.map((opt) => String(opt._id))
                    }
                    onChange={handleChange}
                    input={
                        <OutlinedInput
                            label={label}
                            error={Boolean(error)}
                            sx={{
                                borderRadius: "14px",
                                backgroundColor: "#F8FAFC",
                                fontSize: "13px",
                                "& fieldset": { borderColor: error ? "#EF4444" : "#E2E8F0" },
                                "&:hover fieldset": { borderColor: error ? "#EF4444" : "#CBD5E1" },
                                "&.Mui-focused fieldset": { borderColor: error ? "#EF4444" : "#0256E8" },
                            }}
                        />
                    }
                    renderValue={renderValue}
                    MenuProps={{
                        PaperProps: {
                            component: Paper,
                            elevation: 0,
                            sx: {
                                borderRadius: "14px",
                                border: "1px solid #E2E8F0",
                                boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.08)",
                                mt: 1,
                                maxHeight: 280,
                                "& .MuiMenuItem-root": {
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: "#334155",
                                    borderRadius: "8px",
                                    mx: 0.8,
                                    my: 0.2,
                                    py: 0.8,
                                    "&.Mui-selected": {
                                        bgcolor: "#EFF6FF !important",
                                        color: "#0256E8",
                                    },
                                    "&:hover": {
                                        bgcolor: "#F8FAFC",
                                    },
                                },
                            },
                        },
                    }}
                >
                    {options.length > 0 && !isSingleSelect && (
                        <Box>
                            <MenuItem value="select-all">
                                <Checkbox
                                    checked={allSelected}
                                    indeterminate={!allSelected && someSelected}
                                    size="small"
                                    sx={{
                                        color: "#94A3B8",
                                        "&.Mui-checked, &.MuiCheckbox-indeterminate": {
                                            color: "#0256E8",
                                        },
                                    }}
                                />
                                <ListItemText
                                    primary={allSelected ? "Deselect All" : "Select All"}
                                    primaryTypographyProps={{
                                        fontSize: "12px",
                                        fontWeight: 800,
                                        color: "#0256E8",
                                    }}
                                />
                            </MenuItem>
                            <Divider sx={{ my: 0.5, borderColor: "#F1F5F9" }} />
                        </Box>
                    )}

                    {options.map((option) => {
                        const { isAssigned, assignedNames } = getDisabledState(option);
                        const isSelected = selectedOptions.some(
                            (sel) => String(sel._id) === String(option._id)
                        );

                        return (
                            <MenuItem
                                key={String(option._id)}
                                value={String(option._id)}
                                disabled={isAssigned}
                            >
                                {!isSingleSelect && (
                                    <Checkbox
                                        checked={isSelected}
                                        disabled={isAssigned}
                                        size="small"
                                        sx={{
                                            mr: 0.5,
                                            color: "#94A3B8",
                                            "&.Mui-checked": {
                                                color: "#0256E8",
                                            },
                                        }}
                                    />
                                )}

                                <ListItemText
                                    primary={
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                width: "100%",
                                                gap: 1.5,
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                                color={isAssigned ? "#94A3B8" : "#0F172A"}
                                                fontSize="12px"
                                            >
                                                {option.name}
                                            </Typography>

                                            {assignedNames?.filter(Boolean).length > 0 && (
                                                <Chip
                                                    label={`${isAssigned ? "Assigned: " : "Current: "}${assignedNames.join(", ")}`}
                                                    size="small"
                                                    sx={{
                                                        height: "18px",
                                                        fontSize: "9px",
                                                        fontWeight: 800,
                                                        bgcolor: isAssigned ? "#FEF2F2" : "#ECFDF5",
                                                        color: isAssigned ? "#EF4444" : "#059669",
                                                        borderRadius: "6px",
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    }
                                />
                            </MenuItem>
                        );
                    })}
                </Select>

                {Boolean(error) && Boolean(helperText) && (
                    <FormHelperText sx={{ color: "#EF4444", fontSize: "11px", ml: 1 }}>
                        {helperText}
                    </FormHelperText>
                )}
            </FormControl>
        </Box>
    );
};

export default MultiSelectDropdown;