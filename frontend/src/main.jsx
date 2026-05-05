import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./App1.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { GlobalUserContextProvider } from "./contexts/UserContexts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10,
      refetchOnWindowFocus: false,
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <GlobalUserContextProvider>
          <App />
        </GlobalUserContextProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);