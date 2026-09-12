"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Search,
  Menu as MenuIcon,
  X,
  Home,
  Calendar,
  Grid3X3,
  Award,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

// MUI Imports
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/events", label: "Explore Events", icon: Calendar },
  { href: "/events?view=categories", label: "Categories", icon: Grid3X3 },
  { href: "/verify/check", label: "Verify Certificate", icon: Award },
];

export function Navigation() {
  const pathname = usePathname();
  const theme = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={isScrolled ? 1 : 0}
        sx={{
          backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.9)" : "#ffffff",
          backdropFilter: isScrolled ? "blur(12px)" : "none",
          borderBottom: "1px solid",
          borderColor: "divider",
          transition: "all 0.3s ease",
          color: "text.primary",
        }}
      >
        <div className="container-page">
          <Toolbar disableGutters sx={{ minHeight: "64px !important", justifyContent: "space-between" }}>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 cursor-pointer" style={{ textDecoration: 'none' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">
                Edu<span style={{ color: theme.palette.primary.main }}>Events</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href.split("?")[0]));
                return (
                  <Button
                    key={link.href}
                    component={Link}
                    href={link.href}
                    variant={isActive ? "contained" : "text"}
                    color={isActive ? "primary" : "inherit"}
                    disableElevation
                    sx={{
                      borderRadius: "12px",
                      px: 1.5,
                      py: 0.5,
                      fontSize: { xs: "0.75rem", lg: "0.875rem" },
                      fontWeight: isActive ? 700 : 600,
                      color: isActive ? "white" : "text.secondary",
                      backgroundColor: isActive ? theme.palette.primary.main : "transparent",
                      "&:hover": {
                        backgroundColor: isActive
                          ? theme.palette.primary.dark
                          : theme.palette.action.hover,
                        color: isActive ? "white" : "text.primary",
                      },
                    }}
                  >
                    {link.label}
                  </Button>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Button
                component={Link}
                href="/events?search=true"
                variant="outlined"
                color="inherit"
                startIcon={<Search size={14} />}
                sx={{
                  display: { xs: "none", lg: "flex" },
                  borderRadius: "12px",
                  borderColor: "divider",
                  color: "text.secondary",
                  py: 0.5,
                  px: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  "&:hover": { backgroundColor: "action.hover" },
                }}
              >
                Search events…
              </Button>

              {!pathname.startsWith("/admin") ? (
                <Button
                  component={Link}
                  href="/admin"
                  variant="contained"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    backgroundColor: "#0f172a", // slate-900
                    color: "white",
                    borderRadius: "12px",
                    px: 1.5,
                    py: 0.5,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: theme.shadows[1],
                    "&:hover": { backgroundColor: "#1e293b" }, // slate-800
                  }}
                >
                  <Shield size={14} color={theme.palette.primary.light} />
                  <span>Admin Portal</span>
                </Button>
              ) : (
                <Chip
                  icon={<Shield size={14} />}
                  label="Admin Panel"
                  color="primary"
                  variant="outlined"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    borderRadius: "8px",
                    backgroundColor: theme.palette.primary.light + "20",
                    border: `1px solid ${theme.palette.primary.light}50`,
                  }}
                />
              )}

              {/* Mobile menu button */}
              <IconButton
                sx={{ display: { xs: "flex", md: "none" } }}
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                color="inherit"
                aria-label="Toggle menu"
              >
                {isMobileOpen ? <X size={20} /> : <MenuIcon size={20} />}
              </IconButton>
            </div>
          </Toolbar>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
              className="md:hidden bg-white border-t border-slate-100"
            >
              <div className="container-page py-4 space-y-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Button
                      key={link.href}
                      component={Link}
                      href={link.href}
                      fullWidth
                      variant={isActive ? "contained" : "text"}
                      color={isActive ? "primary" : "inherit"}
                      disableElevation
                      startIcon={<link.icon size={16} />}
                      sx={{
                        justifyContent: "flex-start",
                        borderRadius: "12px",
                        px: 2,
                        py: 1.5,
                        fontWeight: 600,
                        color: isActive ? "white" : "text.secondary",
                        backgroundColor: isActive ? theme.palette.primary.main : "transparent",
                      }}
                    >
                      {link.label}
                    </Button>
                  );
                })}
                <div className="pt-2">
                  <Button
                    component={Link}
                    href="/admin"
                    fullWidth
                    variant="contained"
                    startIcon={<Shield size={16} color={theme.palette.primary.light} />}
                    sx={{
                      backgroundColor: "#0f172a",
                      color: "white",
                      borderRadius: "12px",
                      py: 1.5,
                      fontWeight: 700,
                      "&:hover": { backgroundColor: "#1e293b" },
                    }}
                  >
                    Admin Portal
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </AppBar>

      {/* Spacer */}
      <Toolbar sx={{ minHeight: "64px !important" }} />
    </>
  );
}
