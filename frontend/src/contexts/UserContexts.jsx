import React, {
  useEffect,
  useState,
  useRef,
  createContext,
  useContext,
} from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";

// Creating context
const UserContext = createContext();

export const GlobalUserContextProvider = ({ children }) => {
  const navigate = useNavigate();


  // Get user from localStorage initially
  const [currentUser, setCurrentUser] = useState(() => {
    const data = localStorage.getItem("current_user");

    try {
      return data ? JSON.parse(data) : null;
    } catch (error) {
      localStorage.removeItem("current_user");
      return null;
    }
  });

  useEffect(() => {

    const fetchUser = async () => {
      try {
        const res = await API.get("/api/getMe");

        const data = res.data;

        if (data?.success && data?.data) {
          setCurrentUser(data.data);

          localStorage.setItem(
            "current_user",
            JSON.stringify(data.data)
          );

          if (data?.token) {
            localStorage.setItem("token", data.token);
          }
        } else {
          throw new Error("Session expired");
        }
      } catch (error) {
        console.log("Fetch User Error:", error);

        if (error.code === "ECONNABORTED") {
          toast.error("Request timeout (10s). Try again.");
        } else {
          toast.error("Session Expired! Please Login Again");
        }

        localStorage.clear();

        setCurrentUser(null);

        navigate("/login", { replace: true });
      }
    };

    fetchUser();
  }, []);

  // Store data in localStorage
  const storeDataInLocalStorage = ({ key, value }) => {
    try {
      const jsonValue = JSON.stringify(value);

      localStorage.setItem(key, jsonValue);

      if (key === "current_user") {
        setCurrentUser(value);
      }

      return true;
    } catch (error) {
      console.error("Error storing data:", error);
      return false;
    }
  };

  // Get data from localStorage
  const getDataFromLocalStorage = (key) => {
    try {
      const value = localStorage.getItem(key);

      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Error retrieving data:", error);
      return null;
    }
  };

  // Login function
  const login = (data) => {
    try {
      if (!data) return;

      localStorage.setItem(
        "current_user",
        JSON.stringify(data)
      );

      setCurrentUser(data);

      toast.success("Login Success");

      navigate("/", { replace: true });
    } catch (error) {
      console.log("Login Error:", error);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // await logoutApi();

      localStorage.removeItem("current_user");
      localStorage.removeItem("token");

      setCurrentUser(null);

      navigate("/login", { replace: true });

      toast.success("Logout Success");
    } catch (error) {
      console.log("Logout Error:", error);
    }
  };

  // Memoized context value
  const contextValue = React.useMemo(
    () => ({
      currentUser,
      setCurrentUser,
      storeDataInLocalStorage,
      getDataFromLocalStorage,
      login,
      logout,
    }),
    [currentUser]
  );

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Custom Hook
export const UserContextHook = () => {
  return useContext(UserContext);
};