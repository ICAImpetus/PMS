import { useState, useCallback } from "react";
import { UserContextHook } from "../contexts/UserContexts";

let isLoggingOut = false;

export const useApi = (apiFn, options = {}) => {
  const { isPublic = false } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { currentUser, logout } = UserContextHook();

  const request = useCallback(
    async (...args) => {
      if (!currentUser && !isPublic) {
        if (isLoggingOut) return;

        isLoggingOut = true;
        logout("Session expired. Please log in again.");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await apiFn(...args);

        return res.data;
      } catch (err) {
        if (err.response?.status === 401) {
          if (isLoggingOut) return;

          isLoggingOut = true;
          logout("Session expired. Please log in again.");
          return;
        }

        setError(err.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [apiFn, currentUser, isPublic, logout],
  );

  return { request, loading, error };
};