import { useState, useCallback } from "react";
import { UserContextHook } from "../contexts/UserContexts";

let isLoggingOut = false;

export const useApi = (apiFn, options = {}) => {
  const { isPublic = false } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { currentUser, logout } = UserContextHook();

  const request = useCallback(async (...args) => {

    //  FIXED condition
    if (!currentUser && !isPublic) {
      if (!isLoggingOut) {
        isLoggingOut = true;
        logout("Session expired. Please log in again.");
      }

      return {
        success: false,
        message: "Session expired",
      };
    }

    try {
      setLoading(true);
      setError(null);

      const res = await apiFn(...args);

      return res.data;

    } catch (err) {
      console.log("Error in ", err);

      const status = err.response?.status;
      const message =
        err.response?.data?.message || "Something went wrong";

      if (status === 401) {
        if (!isLoggingOut) {
          isLoggingOut = true;
          logout("Session expired. Please log in again.");
        }

        return {
          success: false,
          message: "Unauthorized",
        };
      }

      setError(message);


      return {
        success: false,
        message,
      };

    } finally {
      setLoading(false);
    }

  }, [apiFn, currentUser, isPublic, logout]);

  return { request, loading, error };
};