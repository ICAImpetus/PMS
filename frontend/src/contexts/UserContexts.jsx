import React, { useEffect, useState, createContext, useContext } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";

// Creating context
const UserContext = createContext();
export const GlobalUserContextProvider = (props) => {
  const navigate = useNavigate()

  const [currentUser, setCurrentUser] = useState(() => {
    const data = localStorage.getItem("current_user");
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      localStorage.removeItem("current_user");
      return null;
    }
  }); // Initialize currentUser as null


  useEffect(() => {
    const fetchUser = async () => {
      try {

        const res = await API.get("/api/getMe");

        const data = res.data; //  axios me direct data milta hai

        if (data?.success && data?.data) {
          setCurrentUser(data.data);
          localStorage.setItem("current_user", JSON.stringify(data.data));

          if (data.token) {
            localStorage.setItem("token", data.token);
          }
        } else {
          throw new Error("Session expired");
        }

      } catch (error) {
        console.log("Error", error);

        //  Timeout handle
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

  const storeDataInLocalStorage = async ({ key, value }) => {
    try {
      const jsonValue = JSON.stringify(value);
      await localStorage.setItem(key, jsonValue);
      if (key === "current_user") {
        setCurrentUser(value);
      }
      return true;
    } catch (error) {
      console.error("Error storing data in local storage:", error);
      return false;
    }
  };

  const getDataFromLocalStorage = async (key) => {
    try {
      const value = await localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Error retrieving data from local storage:", error);
      return null;
    }
  };

  const login = (data) => {
    console.log("data", data);

    if (data) {
      localStorage.setItem("current_user", JSON.stringify(data));
      setCurrentUser(data)
      toast.success("Login Success")
      navigate("/", { replace: true })
    }


  }

  // Context provider value
  const contextValue = React.useMemo(() => ({
    currentUser,
    setCurrentUser,
    storeDataInLocalStorage,
    getDataFromLocalStorage,
    login,
    logout: async () => {
      try {
        // await logoutApi();
      } finally {
        localStorage.removeItem("current_user");
        setCurrentUser(null);
      }
    },
  }), [currentUser]);

  return (
    <UserContext.Provider value={contextValue}>
      {props.children}
    </UserContext.Provider>
  );
};

export const UserContextHook = () => {
  // Importing necessary values from UserContext
  const {
    currentUser,
    setCurrentUser,
    storeDataInLocalStorage,
    getDataFromLocalStorage,
    logout,
    login
  } = useContext(UserContext);

  // Returning context values and functions
  return {
    currentUser,
    setCurrentUser,
    storeDataInLocalStorage,
    getDataFromLocalStorage,
    logout,
    login
  };
};
