import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./App1.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { GlobalUserContextProvider } from "./contexts/UserContexts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10,
      refetchOnWindowFocus: false,
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));

function Root() {
  const [theme, colorMode] = useMode();

  return (
    <React.StrictMode>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {/* Global Toaster mounted here so it's available to providers below */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
            }}
          />
          <BrowserRouter>
            <QueryClientProvider client={queryClient}>
              <GlobalUserContextProvider>
                <App />
              </GlobalUserContextProvider>
            </QueryClientProvider>
          </BrowserRouter>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </React.StrictMode>
  );
}

root.render(<Root />);