import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import './App1.css'
import App from "./App";
import { BrowserRouter } from "react-router-dom";
// import { GlobalUserContextProvider } from "./contexts/UserContextProvider";
import { GlobalUserContextProvider } from "./contexts/UserContexts";
import { GlobalHospitalContextProvider } from "./contexts/HospitalContexts";

const root = ReactDOM.createRoot(document.getElementById("root"));

// this is the variable that will denote loginStatus
// const isLoggedIn = false;

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <GlobalUserContextProvider>
        <GlobalHospitalContextProvider>
          <App />
        </GlobalHospitalContextProvider>
      </GlobalUserContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
