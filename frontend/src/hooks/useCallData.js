import React, { useState, useEffect, useMemo } from "react";
import { getDataFunc } from "../utils/services";
import moment from "moment";

export const useCallData = () => {
  const [allCalls, setAllCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { 
    const fetchCalls = async () => {
      try {
        setIsLoading(true);
        const response = await getDataFunc("api/getCallData");
        console.log("API Response:", response); // Debug log

        if (response?.success) {
          setAllCalls(response.data || []);
        } else {
          throw new Error(response?.message || "Failed to fetch call data");
        }
      } catch (err) {
        console.error("Error fetching call data:", err);
        setError(err.message);
        setAllCalls([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalls();
  }, []);

  // Calculate 'totalCallsToday' with better error handling
  const totalCallsToday = useMemo(() => {
    if (!allCalls || allCalls.length === 0) {
      return 0;
    }

    const todayStart = moment().startOf("day");
    const todayEnd = moment().endOf("day");

    console.log("All calls data:", allCalls); // Debug log

    const todayCalls = allCalls.filter((call) => {
      try {
        // Try multiple possible date fields
        let callDate;

        if (call.startTime) {
          callDate = moment(call.startTime);
        } else if (call.timestamp) {
          callDate = moment(call.timestamp);
        } else if (call.createdAt) {
          callDate = moment(call.createdAt);
        } else if (call.timeStamp) {
          callDate = moment(call.timeStamp);
        } else if (call.date) {
          callDate = moment(call.date);
        } else {
          return false; // No date field found
        }

        // Check if the call date is today
        return callDate.isBetween(todayStart, todayEnd);
      } catch (error) {
        console.warn("Error processing call date:", error, call);
        return false;
      }
    });

    console.log("Today's calls count:", todayCalls.length); // Debug log
    return todayCalls.length;
  }, [allCalls]);

  return { allCalls, totalCallsToday, isLoading, error };
};
