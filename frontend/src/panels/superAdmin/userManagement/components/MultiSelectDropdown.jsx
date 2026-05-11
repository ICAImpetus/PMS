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
} from "@mui/material";

const MultiSelectDropdown = ({
    options = [],
    selectedOptions = [],
    setSelectedOptions,
    label = "Select Options",
    role,
    currentId = null,
    isSingleSelect = false
}) => {

    // 🔹 Disabled logic
    const getDisabledState = (option) => {
        const assignmentFieldMap = {
            // admin: "assignedToAdmin",
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
                assignedNames = assignedData.map(user =>
                    typeof user === "object" ? user?.name : ""
                );
            }
            isAssigned = false;
        } else if (assignedData) {
            const assignedId = typeof assignedData === "object" ? assignedData?._id : assignedData;

            if (assignedId && currentId && String(assignedId) === String(currentId)) {
                isAssigned = false;
            } else {
                isAssigned = true;
            }

            assignedNames = [
                typeof assignedData === "object" ? assignedData?.name : ""
            ];
        }

        return { isAssigned, assignedNames };
    };

    const selectableOptions = options.filter(opt => !getDisabledState(opt).isAssigned);

    // All selectable options are selected
    const allSelected = selectableOptions.length > 0 &&
        selectableOptions.every(opt =>
            selectedOptions.some(sel => String(sel?._id) === String(opt?._id))
        );

    // Some but not all selectable options are selected
    const someSelected = selectableOptions.some(opt =>
        selectedOptions.some(sel => String(sel?._id) === String(opt?._id))
    );


    //  HANDLE CHANGE FIXED
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
                    sel =>
                        !selectableOptions.some(
                            opt => String(opt._id) === String(sel._id)
                        )
                );

                setSelectedOptions(remaining);

            } else {

                // add all selectable
                const merged = [
                    ...selectedOptions,
                    ...selectableOptions
                        .filter(
                            opt =>
                                !selectedOptions.some(
                                    sel => String(sel._id) === String(opt._id)
                                )
                        )
                        .map(opt => ({
                            _id: opt._id,
                            name: opt.name
                        }))
                ];

                setSelectedOptions(merged);
            }

            return;
        }

        // Normal multi select
        const selectedObjects = value.map((id) => {
            const fullObj = options.find(
                (opt) => String(opt._id) === String(id)
            );
            return fullObj
                ? { _id: fullObj._id, name: fullObj.name }
                : null;
        }).filter(Boolean);

        setSelectedOptions(selectedObjects);
    };

    //  SELECT ALL FIXED (not used anymore, logic in handleChange)
    // const handleSelectAll = () => {};

    const handleDelete = (id) => {
        setSelectedOptions(
            selectedOptions.filter(item => String(item._id) !== String(id))
        );
    };

    //  RENDER VALUE FIXED
    const renderValue = (selectedIds) => {
        const selected = options.filter(opt =>
            selectedIds.includes(String(opt._id))
        );

        return (
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "nowrap",
                    gap: 0.5,
                    overflowX: "auto",
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
                    />
                ))}

                {selected.length > 3 && (
                    <Chip label={`+${selected.length - 3}`} size="small" />
                )}
            </Box>
        );
    };

    return (
        <Box sx={{ margin: "auto" }}>
            <FormControl fullWidth variant="standard">
                <InputLabel>{label}</InputLabel>

                <Select
                    multiple={!isSingleSelect} //  FIXED
                    value={
                        isSingleSelect
                            ? selectedOptions[0]?._id || ""
                            : selectedOptions.map(opt => String(opt._id))
                    }
                    onChange={handleChange}
                    renderValue={renderValue}
                >
                    {options.length > 0 && !isSingleSelect && (
                        <>
                            <MenuItem value="select-all">
                                <Checkbox
                                    checked={allSelected}
                                    indeterminate={!allSelected && someSelected}
                                />
                                <ListItemText
                                    primary={allSelected ? "Deselect All" : "Select All"}
                                />
                            </MenuItem>
                            <Divider />
                        </>
                    )}

                    {options.map((option) => {
                        const { isAssigned, assignedNames } = getDisabledState(option);
                        const isSelected = selectedOptions.some(
                            sel => String(sel._id) === String(option._id)
                        );

                        return (
                            <MenuItem
                                key={String(option._id)}
                                value={String(option._id)}
                                disabled={isAssigned}
                            >
                                {!isSingleSelect && (
                                    <Checkbox checked={isSelected} disabled={isAssigned} />
                                )}

                                <ListItemText
                                    primary={
                                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                            <Typography variant="body2">
                                                {option.name}
                                            </Typography>

                                            {assignedNames?.filter(Boolean).length > 0 && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: isAssigned ? "red" : "green",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    {isAssigned ? "Assigned to " : "Current: "}
                                                    {assignedNames.join(", ")}
                                                </Typography>
                                            )}
                                        </Box>
                                    }
                                />
                            </MenuItem>
                        );
                    })}
                </Select>
            </FormControl>
        </Box>
    );
};

export default MultiSelectDropdown;