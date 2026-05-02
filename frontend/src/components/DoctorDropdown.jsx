import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import "./DoctorDropdown.css";
import { Tooltip } from "@mui/material";

function formatSchedule(timings) {
  if (!timings) return "";
  const parts = [];
  if (timings.morning?.start && timings.morning?.end) {
    parts.push(`${timings.morning.start}-${timings.morning.end}`);
  }
  if (timings.evening?.start && timings.evening?.end) {
    parts.push(`${timings.evening.start}-${timings.evening.end}`);
  }
  if (timings.custom?.start && timings.custom?.end) {
    parts.push(`${timings.custom.start}-${timings.custom.end}`);
  }
  return parts.join(", ");
}

export default function DoctorDropdown({
  doctors = [],
  value = null, // Expect object or null
  onChange,
  label = "Select",
  selectedDay = null,
  required = false,
}) {

  const isDoctorAvailableOnDay = (doctor) => {
    if (!selectedDay) return true;
    if (!doctor?.opdDays) return false;
    return doctor.opdDays.includes(selectedDay);
  };

  return (
    <div className="doctor-dropdown-wrapper">

      <Autocomplete
        options={doctors}
        value={value}
        onChange={(event, newValue) => {
          if (!newValue) {
            onChange(null);
            return;
          }
          if (typeof newValue === "object" && !isDoctorAvailableOnDay(newValue)) {
            return;
          }
          onChange(newValue);
        }}
        getOptionLabel={(option) => {
          if (!option) return "";
          if (typeof option === "string") return option;
          const degs = option.degrees && option.degrees.length > 0
            ? ` (${option.degrees.join(", ")})`
            : "";
          return `${option.name || ""}${degs}`;
        }}
        isOptionEqualToValue={(option, val) => {
          if (!option || !val) return false;
          if (typeof option === "string" || typeof val === "string") return option === val;
          return option._id === val?._id;
        }}
        renderOption={(props, option) => {
          if (typeof option === "string") {
            return (
              <li {...props} key={option}>
                <span style={{ fontSize: 13 }}>{option}</span>
              </li>
            );
          }
          const schedule = formatSchedule(option.timings);
          const opdDaysStr = option.opdDays && option.opdDays.length > 0 ? option.opdDays.join(", ") : "";
          const degsStr = option.degrees && option.degrees.length > 0 ? `(${option.degrees.join(", ")})` : "";
          const disabled = !isDoctorAvailableOnDay(option);

          return (
            <li {...props} key={option._id}>
              <Tooltip title={disabled ? `Doctor not available on ${selectedDay || ""}` : ""} placement="top" arrow>
                <div className={`doctor-option ${disabled ? "disabled" : ""}`}>

                  {/* LEFT */}
                  <div className="doctor-option-left">
                    {option.title && (
                      <span className="doctor-option-title">{option.title}</span>
                    )}

                    <span className="doctor-option-name">
                      {option.name || "Unknown"}{" "}
                      {degsStr && (
                        <span className="doctor-option-degrees">{degsStr}</span>
                      )}
                    </span>
                  </div>

                  {/* RIGHT */}
                  <div className="doctor-option-right">

                    {option.experience != null && (
                      <span className="doctor-info-tag">
                        <span className="tag-label">Exp:</span>
                        <span className="tag-value">{option.experience} yrs</span>
                      </span>
                    )}

                    {option.opdNo && (
                      <span className="doctor-info-tag">
                        <span className="tag-label">OPD:</span>
                        <span className="tag-value">{option.opdNo}</span>
                      </span>
                    )}

                    {opdDaysStr && (
                      <span className="doctor-info-tag">
                        <span className="tag-label">Days:</span>
                        <span className="tag-value">{opdDaysStr}</span>
                      </span>
                    )}

                    {option.consultationCharges != null && (
                      <span className="doctor-info-tag">
                        <span className="tag-label">₹</span>
                        <span className="tag-value">
                          {option.consultationCharges}
                        </span>
                      </span>
                    )}

                    {schedule && (
                      <span className="doctor-info-tag">
                        <span className="tag-label">Sched:</span>
                        <span className="tag-value">{schedule}</span>
                      </span>
                    )}

                    <span
                      className={`doctor-availability ${option.isEnabled !== false && !disabled
                        ? "available"
                        : "unavailable"
                        }`}
                    >
                      <span className="doctor-availability-dot"></span>
                      {option.isEnabled !== false && !disabled
                        ? "Available"
                        : "Unavailable"}
                    </span>

                  </div>

                </div>
              </Tooltip>
            </li>
          );
        }}

        componentsProps={{
          popper: {
            className: "doctor-dropdown-popper",
            sx: { minWidth: 650 },
          },
        }}

        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={label}
            required={required}
            size="small"
          />
        )}

        noOptionsText="No doctors found"
        clearOnEscape
        size="small"
      />

    </div>
  );
}