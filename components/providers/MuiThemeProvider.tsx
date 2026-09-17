"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ReactNode } from "react";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb",
      light: "#60a5fa",
      dark: "#1d4ed8",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#0f172a",
      light: "#334155",
      dark: "#020617",
      contrastText: "#ffffff",
    },
    error: { main: "#ef4444" },
    warning: { main: "#f97316" },
    success: { main: "#10b981" },
    info: { main: "#3b82f6" },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
    },
    divider: "#e2e8f0",
  },
  typography: {
    fontFamily: "var(--font-sans), 'Inter', system-ui, sans-serif",
    h1: { fontWeight: 800, letterSpacing: "-0.025em" },
    h2: { fontWeight: 700, letterSpacing: "-0.02em" },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: {
      fontWeight: 600,
      textTransform: "none",
      letterSpacing: 0,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)",
    "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)",
    "0 4px 16px 0 rgb(0 0 0 / 0.10), 0 2px 4px -1px rgb(0 0 0 / 0.06)",
    "0 8px 30px 0 rgb(0 0 0 / 0.12)",
    "0 12px 40px 0 rgb(0 0 0 / 0.14)",
    "0 16px 48px 0 rgb(0 0 0 / 0.16)",
    "0 20px 56px 0 rgb(0 0 0 / 0.18)",
    "0 24px 64px 0 rgb(0 0 0 / 0.20)",
    "0 24px 64px 0 rgb(0 0 0 / 0.20)",
    "0 24px 64px 0 rgb(0 0 0 / 0.20)",
    "0 24px 64px 0 rgb(0 0 0 / 0.20)",
    "0 24px 64px 0 rgb(0 0 0 / 0.20)",
    "0 24px 64px 0 rgb(0 0 0 / 0.20)",
    "0 24px 64px 0 rgb(0 0 0 / 0.20)",
    "0 24px 64px 0 rgb(0 0 0 / 0.20)",
    "0 24px 64px 0 rgb(0 0 0 / 0.20)",
    "0 24px 64px 0 rgb(0 0 0 / 0.20)",
    "0 24px 64px 0 rgb(0 0 0 / 0.20)",
    "0 24px 64px 0 rgb(0 0 0 / 0.20)",
    "0 24px 64px 0 rgb(0 0 0 / 0.20)",
    "0 24px 64px 0 rgb(0 0 0 / 0.20)",
    "0 24px 64px 0 rgb(0 0 0 / 0.20)",
    "0 24px 64px 0 rgb(0 0 0 / 0.20)",
    "0 24px 64px 0 rgb(0 0 0 / 0.20)",
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { margin: 0, padding: 0 } },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "8px 20px",
          fontWeight: 600,
          fontSize: "0.875rem",
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
        contained: {
          "&:hover": {
            boxShadow: "0 4px 12px 0 rgba(37,99,235,0.3)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: "0.75rem" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)",
          border: "1px solid #e2e8f0",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            fontSize: "0.875rem",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: "none",
          fontSize: "0.875rem",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { fontSize: "0.8125rem", padding: "12px 16px" },
        head: {
          fontWeight: 600,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          fontSize: "0.6875rem",
          backgroundColor: "#f8fafc",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": { backgroundColor: "#f8fafc" },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "0.75rem",
          borderRadius: 8,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: { fontWeight: 700 },
      },
    },
  },
});

export function MuiThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
