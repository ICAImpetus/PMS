import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";

// Legacy color design tokens export for backwards compatibility
export const tokensOld = (mode) => ({
  ...(mode === "dark"
    ? {
        grey: {
          100: "#e0e0e0",
          200: "#c2c2c2",
          300: "#a3a3a3",
          400: "#858585",
          500: "#666666",
          600: "#525252",
          700: "#3d3d3d",
          800: "#292929",
          900: "#141414",
        },
        primary: {
          100: "#d0d1d5",
          200: "#a1a4ab",
          300: "#727681",
          400: "#1F2A40",
          500: "#141b2d",
          600: "#101624",
          700: "#0c101b",
          800: "#080b12",
          900: "#040509",
        },
        secondary: {
          100: "#CEE0F3",
          200: "#91B9E3",
          300: "#5090D3",
          400: "#265D97",
          500: "#1E4976",
          600: "#845bf5",
          700: "#132F4C",
          800: "#001E3C",
          900: "#0A1929",
        },
        greyish: {
          100: "#cbd5e1",
          200: "#7c3aed",
          300: "#fecaca",
          400: "#06b6d4",
          700: "#334155",
          800: "#18181b",
          900: "#374151",
        },
        greenAccent: {
          100: "#dbf5ee",
          200: "#b7ebde",
          300: "#94e2cd",
          400: "#70d8bd",
          500: "#4cceac",
          600: "#3da58a",
          700: "#2e7c67",
          800: "#1e5245",
          900: "#0f2922",
        },
        redAccent: {
          100: "#f8dcdb",
          200: "#f1b9b7",
          300: "#e99592",
          400: "#e2726e",
          500: "#db4f4a",
          600: "#af3f3b",
          700: "#832f2c",
          800: "#58201e",
          900: "#2c100f",
        },
        blueAccent: {
          100: "#e1e2fe",
          200: "#c3c6fd",
          300: "#a4a9fc",
          400: "#868dfb",
          500: "#6870fa",
          600: "#535ac8",
          700: "#3e4396",
          800: "#2a2d64",
          900: "#151632",
        },
        orangeAccent: {
          100: "#ffd4b3",
          200: "#ffb380",
          300: "#ff924d",
          400: "#ff711a",
          500: "#e65100",
          600: "#cc4700",
          700: "#b33e00",
          800: "#993500",
          900: "#802c00",
        },
      }
    : {
        grey: {
          100: "#f5f5f5",
          200: "#eeeeee",
          300: "#e0e0e0",
          400: "#bdbdbd",
          500: "#9e9e9e",
          600: "#757575",
          700: "#616161",
          800: "#424242",
          900: "#212121",
        },
        primary: {
          100: "#ffffff",
          200: "#f5f5f5",
          300: "#e0e0e0",
          400: "#bdbdbd",
          500: "#9e9e9e",
          600: "#757575",
          700: "#616161",
          800: "#424242",
          900: "#212121",
        },
        secondary: {
          100: "#FFE0B2",
          200: "#FFCC80",
          300: "#FFB74D",
          400: "#FFA726",
          500: "#e3dbcf",
          600: "#845bf5",
          700: "#F57C00",
          800: "#bedcf7",
          900: "#E65100",
        },
        greyish: {
          100: "#e0f7fa",
          200: "#80deea",
          300: "#4dd0e1",
          400: "#26c6da",
          700: "#00838f",
          800: "#006064",
          900: "#004d40",
        },
        greenAccent: {
          100: "#e8f5e9",
          200: "#c8e6c9",
          300: "#a5d6a7",
          400: "#81c784",
          500: "#66bb6a",
          600: "#4caf50",
          700: "#388e3c",
          800: "#2e7d32",
          900: "#1b5e20",
        },
        redAccent: {
          100: "#ffebee",
          200: "#ffcdd2",
          300: "#ef9a9a",
          400: "#e57373",
          500: "#ef5350",
          600: "#f44336",
          700: "#d32f2f",
          800: "#c62828",
          900: "#b71c1c",
        },
        blueAccent: {
          100: "#e3f2fd",
          200: "#bbdefb",
          300: "#90caf9",
          400: "#64b5f6",
          500: "#42a5f5",
          600: "#2196f3",
          700: "#1e88e5",
          800: "#1976d2",
          900: "#1565c0",
        },
        orangeAccent: {
          100: "#fff3e0",
          200: "#ffe0b2",
          300: "#ffcc80",
          400: "#ffb74d",
          500: "#ffa726",
          600: "#ff9800",
          700: "#f57c00",
          800: "#ef6c00",
          900: "#e65100",
        },
      }),
});

// Modern color design tokens optimized for DataGrid and dashboard components
export const tokens = (mode) => ({
  // Primary colors
  primary: {
    50: mode === "dark" ? "#F0F7FF" : "#E0F2FF",
    100: mode === "dark" ? "#C2E0FF" : "#B3E5FC",
    200: mode === "dark" ? "#99CCF3" : "#81D4FA",
    300: mode === "dark" ? "#66B2FF" : "#4FC3F7",
    // 400: mode === "dark" ? '#3399FF' : '#29B6F6',
    400: mode === "dark" ? "#003A75" : "#f1f5f9",
    500: mode === "dark" ? "#007FFF" : "#03A9F4",
    600: mode === "dark" ? "#0072E5" : "#039BE5",
    700: mode === "dark" ? "#0059B2" : "#0288D1",
    // 800: mode === "dark" ? '#001F3F' : '#E3F2FD',
    // 800: mode === "dark" ? '#0e161f' : '#E3F2FD',
    // 800: mode === "dark" ? '#0e161f' : '#E3F2FD',
    800: mode === "dark" ? "#0e161f" : "#ffffff",
    // 900: mode === "dark" ? '#003A75' : '#FFA726', //light is of orancge shade here
    // 900: mode === "dark" ? '#0b2238' : '#E3F2FD', //previous one
    // 900: mode === "dark" ? '#031623' : '#E3F2FD',
    900: mode === "dark" ? "#031623" : "#ffffff",
    950: mode === "dark" ? "#010b13" : "#E3F2FD",
    960: mode === "dark" ? "#0F171E" : "#E3F2FD",
  },
  // Secondary colors
  secondary: {
    50: mode === "dark" ? "#E2EDF8" : "#FFF3E0",
    100: mode === "dark" ? "#CEE0F3" : "#FFE0B2",
    200: mode === "dark" ? "#91B9E3" : "#FFCC80",
    300: mode === "dark" ? "#5090D3" : "#FFB74D",
    400: mode === "dark" ? "#265D97" : "#FFA726",
    500: mode === "dark" ? "#1E4976" : "#eeeeee",
    600: mode === "dark" ? "#845bf5" : "#845bf5",
    700: mode === "dark" ? "#132F4C" : "#F57C00",
    800: mode === "dark" ? "#001E3C" : "#bedcf7",
    900: mode === "dark" ? "#0A1929" : "#E65100",
  },
  // Green accent colors (keep the same if these are neutral)
  // Green accent colors for light and dark modes
  greenAccent: {
    50: mode === "dark" ? "#E1F2E1" : "#E3F8E5",
    100: mode === "dark" ? "#A9D5A9" : "#C1E7B5",
    200: mode === "dark" ? "#79B479" : "#9FD68C",
    300: mode === "dark" ? "#589B58" : "#1F8C0E",
    400: mode === "dark" ? "#388238" : "#5BC63D",
    500: mode === "dark" ? "#217121" : "#035922", // Darker primary green for dark mode
    600: mode === "dark" ? "#589B58" : "#5BC63D",
    700: mode === "dark" ? "#388238" : "#289916",
    800: mode === "dark" ? "#104110" : "#1F8C0E",
    900: mode === "dark" ? "#0C330C" : "#167F07", // Darkest green for dark mode
  },

  // Red accent colors
  redAccent: {
    50: mode === "dark" ? "#FFEBEE" : "#FFEBEE",
    100: mode === "dark" ? "#FFCDD2" : "#FFCDD2",
    200: mode === "dark" ? "#EF9A9A" : "#EF9A9A",
    300: mode === "dark" ? "#E57373" : "#E57373",
    400: mode === "dark" ? "#EF5350" : "#EF5350",
    500: mode === "dark" ? "#F44336" : "#F44336",
    600: mode === "dark" ? "#E53935" : "#E53935",
    700: mode === "dark" ? "#D32F2F" : "#D32F2F",
    800: mode === "dark" ? "#C62828" : "#C62828",
    900: mode === "dark" ? "#B71C1C" : "#B71C1C",
  },
  // Blue accent colors
  blueAccent: {
    50: mode === "dark" ? "#E3F2FD" : "#E3F2FD",
    100: mode === "dark" ? "#BBDEFB" : "#BBDEFB",
    200: mode === "dark" ? "#90CAF9" : "#90CAF9",
    300: mode === "dark" ? "#64B5F6" : "#64B5F6",
    400: mode === "dark" ? "#42A5F5" : "#42A5F5",
    500: mode === "dark" ? "#2196F3" : "#2196F3",
    600: mode === "dark" ? "#1E88E5" : "#1E88E5",
    // 700: mode === "dark" ? '#1976D2' : '#1976D2',
    700: mode === "dark" ? "#3e4396" : "#a4a9fc",
    800: mode === "dark" ? "#1565C0" : "#1565C0",
    900: mode === "dark" ? "#0D47A1" : "#0D47A1",
  },

  // Grey colors (adjust to be more subtle in light mode)
  grey: {
    50: mode === "dark" ? "#F3F6F9" : "#FAFAFA",
    100: mode === "dark" ? "#E7EBF0" : "#161b33",
    200: mode === "dark" ? "#E0E3E7" : "#EEEEEE",
    // 300: mode === "dark" ? '#CDD2D7' : '#E0E0E0',
    300: mode === "dark" ? "#CDD2D7" : "#f3f6f4",
    400: mode === "dark" ? "#B2BAC2" : "#BDBDBD",
    500: mode === "dark" ? "#A0AAB4" : "#9E9E9E",
    600: mode === "dark" ? "#6F7E8C" : "#757575",
    700: mode === "dark" ? "#3E5060" : "#616161",
    800: mode === "dark" ? "#0f172a" : "#E7EBF0",
    900: mode === "dark" ? "#1A2027" : "#212121",
  },
  orangeAccent: {
    50: mode === "dark" ? "#F5F5F5" : "#FAFAFA",
    100: mode === "dark" ? "#E0E0E0" : "#F5F5F5",
    200: mode === "dark" ? "#BDBDBD" : "#EEEEEE",
    300: mode === "dark" ? "#9E9E9E" : "#E0E0E0",
    400: mode === "dark" ? "#757575" : "#BDBDBD",
    500: mode === "dark" ? "#616161" : "#9E9E9E",
    600: mode === "dark" ? "#424242" : "#757575",
    700: mode === "dark" ? "#212121" : "#616161",
    800: mode === "dark" ? "#121212" : "#424242",
    900: mode === "dark" ? "#000000" : "#212121",
  },

  greyish: {
    100: mode === "dark" ? "#cbd5e1" : "#f9fafb", // dark: slate-300, light: near-white
    200: mode === "dark" ? "#94a3b8" : "#e5e7eb", // dark: slate-400, light: light-gray
    300: mode === "dark" ? "#64748b" : "#d1d5db", // dark: slate-500, light: gray
    400: mode === "dark" ? "#475569" : "#9ca3af", // dark: slate-600, light: dark-gray
    700: mode === "dark" ? "#212f3d" : "#212f3d", //
    800: mode === "dark" ? "#1e293b" : "#475569", // dark: slate-800, light: slate-600
    900: mode === "dark" ? "#0f172a" : "#334155", // dark: slate-900, light: slate-700
  },

  // Additional colors can be added here
});

// Legacy theme settings for backwards compatibility
export const themeSettingsOld = (mode) => {
  const colors = tokensOld(mode);
  return {
    palette: {
      mode: mode,
      ...(mode === "dark"
        ? {
            primary: {
              main: colors.primary[500],
            },
            secondary: {
              main: colors.greenAccent[500],
            },
            neutral: {
              dark: colors.grey[700],
              main: colors.grey[500],
              light: colors.grey[100],
            },
            background: {
              default: colors.primary[500],
            },
          }
        : {
            primary: {
              main: colors.primary[100],
            },
            secondary: {
              main: colors.greenAccent[500],
            },
            neutral: {
              dark: colors.grey[700],
              main: colors.grey[500],
              light: colors.grey[100],
            },
            background: {
              default: colors.primary[100],
            },
          }),
    },
    typography: {
      fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
      fontSize: 12,
      h1: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 40,
      },
      h2: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 32,
      },
      h3: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 24,
      },
      h4: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 20,
      },
      h5: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 16,
      },
      h6: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 14,
      },
    },
  };
};

// Enhanced modern theme settings with improved DataGrid and Card styling
export const themeSettings = (mode) => {
  const colors = tokens(mode);
  return {
    palette: {
      mode: mode,
      ...(mode === "dark"
        ? {
            // Dark mode palette
            primary: {
              main: colors.primary[400],
              light: colors.primary[300],
              dark: colors.primary[600],
            },
            secondary: {
              main: colors.secondary[500],
              light: colors.secondary[400],
              dark: colors.secondary[600],
            },
            error: {
              main: colors.redAccent[500],
              light: colors.redAccent[400],
              dark: colors.redAccent[600],
            },
            warning: {
              main: colors.orangeAccent[500],
              light: colors.orangeAccent[400],
              dark: colors.orangeAccent[600],
            },
            info: {
              main: colors.blueAccent[500],
              light: colors.blueAccent[400],
              dark: colors.blueAccent[600],
            },
            success: {
              main: colors.greenAccent[500],
              light: colors.greenAccent[400],
              dark: colors.greenAccent[600],
            },
            neutral: {
              dark: colors.grey[700],
              main: colors.grey[500],
              light: colors.grey[100],
            },
            background: {
              default: colors.primary[950],
              paper: colors.primary[950],
            },
            text: {
              primary: colors.grey[100],
              secondary: colors.grey[300],
            },
          }
        : {
            // Light mode palette
            primary: {
              main: colors.primary[600],
              light: colors.primary[400],
              dark: colors.primary[800],
            },
            secondary: {
              main: colors.secondary[600],
              light: colors.secondary[400],
              dark: colors.secondary[800],
            },
            error: {
              main: colors.redAccent[600],
              light: colors.redAccent[400],
              dark: colors.redAccent[800],
            },
            warning: {
              main: colors.orangeAccent[600],
              light: colors.orangeAccent[400],
              dark: colors.orangeAccent[800],
            },
            info: {
              main: colors.blueAccent[600],
              light: colors.blueAccent[400],
              dark: colors.blueAccent[800],
            },
            success: {
              main: colors.greenAccent[600],
              light: colors.greenAccent[400],
              dark: colors.greenAccent[800],
            },
            neutral: {
              dark: colors.grey[700],
              main: colors.grey[500],
              light: colors.grey[100],
            },
            background: {
              default: colors.primary[800],
              paper: colors.primary[900],
            },
            text: {
              primary: colors.grey[100],
              secondary: colors.grey[700],
            },
          }),
    },
    typography: {
      fontFamily: ["Inter", "Roboto", "Helvetica", "Arial", "sans-serif"].join(
        ",",
      ),
      fontSize: 14,
      h1: {
        fontFamily: [
          "Inter",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ].join(","),
        fontSize: 40,
        fontWeight: 600,
      },
      h2: {
        fontFamily: [
          "Inter",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ].join(","),
        fontSize: 32,
        fontWeight: 600,
      },
      h3: {
        fontFamily: [
          "Inter",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ].join(","),
        fontSize: 24,
        fontWeight: 600,
      },
      h4: {
        fontFamily: [
          "Inter",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ].join(","),
        fontSize: 20,
        fontWeight: 600,
      },
      h5: {
        fontFamily: [
          "Inter",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ].join(","),
        fontSize: 16,
        fontWeight: 600,
      },
      h6: {
        fontFamily: [
          "Inter",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ].join(","),
        fontSize: 14,
        fontWeight: 600,
      },
    },
    components: {
      // Simple DataGrid styling
      // MuiDataGrid: {
      //   styleOverrides: {
      //     root: {
      //       border: "none",
      //       "& .MuiDataGrid-columnHeaders": {
      //         backgroundColor: mode === "dark" ? colors.blueAccent[700] : colors.blueAccent[700],
      //         borderBottom: "none",
      //       },
      //       "& .MuiDataGrid-cell": {
      //         borderBottom: "none",
      //       },
      //       "& .MuiDataGrid-footerContainer": {
      //         backgroundColor: mode === "dark" ? colors.blueAccent[700] : colors.blueAccent[700],
      //         borderTop: "none",
      //       },
      //       "& .MuiDataGrid-virtualScroller": {
      //         backgroundColor: mode === "dark" ? colors.primary[400] : colors.primary[400],
      //       },
      //     },
      //   },
      // },
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
      },
      // Enhanced Card styling
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor:
              mode === "dark" ? colors.primary[800] : colors.primary[800],
            backgroundImage: "none",
            borderRadius: 12,
            boxShadow:
              mode === "dark"
                ? "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)"
                : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            // border: `1px solid ${mode === "dark" ? colors.grey[700] : colors.grey[300]}`,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              boxShadow:
                mode === "dark"
                  ? "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)"
                  : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              transform: "translateY(-2px)",
            },
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: "24px",
            "&:last-child": {
              paddingBottom: "24px",
            },
          },
        },
      },
      // Enhanced Paper styling
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor:
              mode === "dark" ? colors.primary[950] : colors.primary[800],
            backgroundImage: "none",
          },
        },
      },
      // Enhanced Button styling
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
            fontWeight: 600,
            padding: "8px 16px",
            transition: "all 0.2s ease-in-out",
          },
          // Primary button hover
          containedPrimary: {
            backgroundColor:
              mode === "dark" ? colors.primary[500] : colors.primary[600],
            color: mode === "dark" ? colors.grey[100] : colors.grey[100],
            "&:hover": {
              backgroundColor:
                mode === "dark" ? colors.primary[400] : colors.primary[700],
              transform: "translateY(-1px)",
              boxShadow:
                mode === "dark"
                  ? "0 4px 12px rgba(0, 127, 255, 0.3)"
                  : "0 4px 12px rgba(3, 169, 244, 0.3)",
            },
          },
          // Secondary button hover
          containedSecondary: {
            backgroundColor:
              mode === "dark" ? colors.secondary[500] : colors.secondary[600],
            "&:hover": {
              backgroundColor:
                mode === "dark" ? colors.secondary[400] : colors.secondary[700],
              transform: "translateY(-1px)",
              boxShadow:
                mode === "dark"
                  ? "0 4px 12px rgba(132, 91, 245, 0.3)"
                  : "0 4px 12px rgba(132, 91, 245, 0.3)",
            },
          },
          // Outlined button hover
          outlined: {
            borderWidth: "1.5px",
            "&:hover": {
              borderWidth: "1.5px",
              transform: "translateY(-1px)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            },
          },
          // Error button hover
          containedError: {
            "&:hover": {
              backgroundColor:
                mode === "dark" ? colors.redAccent[400] : colors.redAccent[700],
              transform: "translateY(-1px)",
              boxShadow:
                mode === "dark"
                  ? "0 4px 12px rgba(244, 67, 54, 0.3)"
                  : "0 4px 12px rgba(244, 67, 54, 0.3)",
            },
          },
          // Success button hover
          containedSuccess: {
            "&:hover": {
              backgroundColor:
                mode === "dark"
                  ? colors.greenAccent[400]
                  : colors.greenAccent[700],
              transform: "translateY(-1px)",
              boxShadow:
                mode === "dark"
                  ? "0 4px 12px rgba(76, 175, 80, 0.3)"
                  : "0 4px 12px rgba(56, 142, 60, 0.3)",
            },
          },
          // Warning button hover
          containedWarning: {
            "&:hover": {
              backgroundColor:
                mode === "dark"
                  ? colors.orangeAccent[400]
                  : colors.orangeAccent[700],
              transform: "translateY(-1px)",
              boxShadow:
                mode === "dark"
                  ? "0 4px 12px rgba(255, 152, 0, 0.3)"
                  : "0 4px 12px rgba(245, 124, 0, 0.3)",
            },
          },
        },
      },
      // Enhanced TextField styling
      MuiTextField: {
        defaultProps: {
          size: "small",
        },
        styleOverrides: {
          root: {
            // No custom label or input overrides: use MUI defaults for perfect original alignment
          },
        },
      },
      // Enhanced Select styling (for standalone Select components)
      MuiSelect: {
        styleOverrides: {
          select: {
            fontSize: "0.875rem", // 14px - standalone select content font size
            fontWeight: 400,
          },
        },
      },
      // Enhanced FormControl styling
      MuiFormControl: {
        styleOverrides: {
          root: {
            "& .MuiInputLabel-root": {
              fontSize: "0.875rem", // 14px - form control label size
            },
            "& .MuiOutlinedInput-root": {
              backgroundColor:
                mode === "dark" ? colors.primary[800] : colors.primary[900],
              "& fieldset": {
                // borderColor: mode === "dark" ? colors.primary[600] : colors.grey[400],
              },
              "&:hover fieldset": {
                borderColor:
                  mode === "dark" ? colors.grey[500] : colors.grey[500],
              },
              "&.Mui-focused fieldset": {
                borderColor:
                  mode === "dark" ? colors.primary[400] : colors.primary[600],
              },
            },
          },
        },
      },
    },
  };
};

// Context for color mode
export const ColorModeContext = createContext({
  toggleColorMode: () => {},
});

export const useMode = () => {
  const [mode, setMode] = useState("light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    [],
  );

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return [theme, colorMode];
};

// Export tokens for use in components
export { tokens as modernTokens };
