import React, { useState } from "react";
import { Badge, Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import dayjs from "dayjs";
import { useApi } from "../../../../api/useApi";
import { commonRoutes } from "../../../../api/apiService";
import toast from "react-hot-toast";

// Generate default attendance
const getDefaultAttendance = (opdDays = []) => {

    const attendanceData = {};

    const today = dayjs();

    // Current day + next 7 days
    for (let i = 0; i <= 7; i++) {

        const currentDate = today.add(i, "day");

        const dayName = currentDate.format("dddd");

        const formattedDate =
            currentDate.format("YYYY-MM-DD");

        attendanceData[formattedDate] =
            opdDays.includes(dayName)
                ? "present"
                : "";
    }

    return attendanceData;
};

const DoctorAttendanceCalendar = ({
    doctor,
    unavailableDates = [],
    setUnavailableDates,
}) => {

    console.log("unavailableDates", unavailableDates);

    const handleDateClick = (date) => {

        const formattedDate =
            dayjs(date).format("YYYY-MM-DD");

        setUnavailableDates((prev) => {

            // Remove unavailable date
            if (prev.includes(formattedDate)) {

                return prev.filter(
                    (d) => d !== formattedDate
                );
            }

            // Add unavailable date
            return [
                ...prev,
                formattedDate,
            ];
        });
    };

    const CustomDay = (props) => {

        const {
            day,
            outsideCurrentMonth,
            disabled,
            ...other
        } = props;

        const formattedDate =
            dayjs(day).format("YYYY-MM-DD");

        const dayName =
            dayjs(day).format("dddd");

        // Check OPD day
        const isOpdDay =
            doctor?.opdDays?.includes(dayName);

        // Check unavailable
        const isUnavailable =
            unavailableDates.includes(
                formattedDate
            );

        return (
            <Badge
                overlap="circular"
                badgeContent={
                    isUnavailable ? (
                        <CancelIcon
                            color="error"
                            sx={{
                                fontSize: 16,
                            }}
                        />
                    ) : null
                }
            >
                <Box
                    onClick={() => {

                        if (
                            !disabled &&
                            isOpdDay
                        ) {
                            handleDateClick(day);
                        }
                    }}
                >
                    <PickersDay
                        {...other}
                        day={day}
                        disabled={
                            disabled ||
                            !isOpdDay
                        }
                        outsideCurrentMonth={
                            outsideCurrentMonth
                        }
                        sx={{

                            // Disable style
                            cursor:
                                disabled || !isOpdDay
                                    ? "not-allowed"
                                    : "pointer",

                            opacity:
                                disabled || !isOpdDay
                                    ? 0.35
                                    : 1,

                            borderRadius: "50%",

                            transition: "all 0.2s ease",

                            // REMOVE MUI SELECTED WHITE BG
                            "&.Mui-selected": {
                                backgroundColor: "transparent !important",
                                color: "inherit !important",
                            },

                            "&.Mui-selected:hover": {
                                backgroundColor: "transparent !important",
                            },

                            "&.MuiPickersDay-root:focus": {
                                backgroundColor: "transparent !important",
                            },

                            // Available OPD day
                            ...(isOpdDay &&
                                !isUnavailable && {

                                backgroundColor: "#d4edda",

                                "&:hover": {
                                    backgroundColor: "#c3e6cb",
                                },
                            }),

                            // Unavailable
                            ...(isUnavailable && {

                                backgroundColor: "#f8d7da",

                                "&:hover": {
                                    backgroundColor: "#f5c6cb",
                                },
                            }),
                        }}
                    />
                </Box>
            </Badge>
        );
    };

    return (
        <LocalizationProvider
            dateAdapter={AdapterDayjs}
        >
            <DateCalendar
                disablePast={false}
                shouldDisableDate={(date) => {

                    const today =
                        dayjs().startOf("day");

                    const maxDate =
                        today.add(7, "day");

                    // Disable only:
                    // past dates
                    // after next 7 days
                    return (
                        dayjs(date).isBefore(
                            today,
                            "day"
                        ) ||
                        dayjs(date).isAfter(
                            maxDate,
                            "day"
                        )
                    );
                }}
                slots={{
                    day: CustomDay,
                }}
            />
        </LocalizationProvider>
    );
};

export default DoctorAttendanceCalendar;