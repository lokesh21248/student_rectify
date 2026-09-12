"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar, CheckCircle2, Clock, Users, Award, Building2, Plus,
  Search, Eye, Trash2, Check, X, Star, Filter, LogOut, Loader2,
  Sparkles, ExternalLink, ShieldCheck, Tag, MapPin, Globe, Trophy, Edit,
  Send, UserCheck, School, Upload, FileText, Image as ImageIcon, Copy,
  CheckCheck, Download, FolderUp, HardDrive, Save
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

// MUI Imports
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";

interface AdminDashboardClientProps {
  stats: {
    totalEvents: number;
    liveEvents: number;
    registrations: number;
    attendance: number;
    certificates: number;
    colleges: number;
    categories: number;
  };
  initialEvents: any[];
  categories: any[];
  colleges: any[];
  organizers?: any[];
  registrations: any[];
  certificates: any[];
  banners: any[];
  services: any[];
}

interface UploadedFileItem {
  id: string;
  name: string;
  url: string;
  bucket: string;
  size: number;
  type: string;
  uploaded_at: string;
}

export function AdminDashboardClient({
  stats,
  initialEvents,
  categories,
  colleges,
  organizers = [],
  registrations: initialRegistrations,
  certificates: initialCertificates,
  banners: initialBanners,
  services: initialServices,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<
    "events" | "create" | "banners" | "services" | "colleges" | "registrations" | "certificates" | "storage" | "categories"
  >("banners");

  const [localCategories, setLocalCategories] = useState(categories);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "more-horizontal",
    color: "#6366F1",
    sort_order: 0,
    is_active: true,
  });

  const [events, setEvents] = useState(initialEvents);
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [certificates, setCertificates] = useState(initialCertificates);
  const [banners, setBanners] = useState(initialBanners);
  const [services, setServices] = useState(initialServices);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Edit Modal States
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);

  // Uploading state
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingServiceImg, setUploadingServiceImg] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState("dinesh_project");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Banner Form State
  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    image_path: "",
    cta_text: "",
    cta_action: "",
    is_active: true,
    sort_order: 0,
    start_date: "",
    end_date: "",
  });

  // Service Form State
  const [serviceForm, setServiceForm] = useState({
    category_id: categories[0]?.id || "",
    name: "",
    description: "",
    price: "",
    discount_price: "",
    duration_minutes: 60,
    image_path: "",
    is_active: true,
    sort_order: 0,
  });

  // Form State for Create Event (Matches 100% SQL DB Schema)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    short_description: "",
    description: "",
    category_id: categories[0]?.id || "",
    college_id: colleges[0]?.id || "",
    organizer_name: "Technical Council",
    mode: "offline" as "online" | "offline" | "hybrid",
    venue: "",
    address: "",
    city: "New Delhi",
    state: "Delhi",
    meeting_url: "",
    start_at: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    end_at: new Date(Date.now() + 172800000).toISOString().slice(0, 16),
    registration_deadline: new Date(Date.now() + 80000000).toISOString().slice(0, 16),
    max_participants: 500,
    eligibility: "Open to all verified college students with valid student ID.",
    rules: "Standard code of conduct and fair participation rules apply.",
    prize_info: "₹1,00,000 Total Prize Pool + Certificates",
    banner_url: "",
    has_certificate: true,
    featured: false,
    status: "published" as "published" | "draft",
    tags: "Hackathon, Tech, Innovation",
  });
  const [creating, setCreating] = useState(false);

  // Form State for Issue Certificate
  const [certForm, setCertForm] = useState({
    recipient_name: "",
    recipient_email: "",
    event_title: "HackIndia 2026: National Collegiate Hackathon",
    college_name: colleges[0]?.name || "Indian Institute of Technology Delhi",
    issue_date: new Date().toISOString().split("T")[0],
  });
  const [issuingCert, setIssuingCert] = useState(false);

  // Auto generate slug from title
  const handleTitleChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setFormData((prev) => ({ ...prev, title: val, slug }));
  };

  const handleCategoryNameChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setCategoryForm((prev) => ({ ...prev, name: val, slug }));
  };

  // Upload file helper to /api/upload
  const uploadFileToSupabase = async (file: File, bucket = "dinesh_project", folder = "admin-uploads") => {
    const data = new FormData();
    data.append("file", file);
    data.append("bucket", bucket);
    data.append("folder", folder);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: data,
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "File upload failed");
    }

    return result;
  };

  // File Upload Handlers for Create / Edit Banner
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const res = await uploadFileToSupabase(file, "event-images", "event-banners");
      const newUrl = `${res.url}?t=${Date.now()}`;
      if (isEdit && editingEvent) {
        setEditingEvent({ ...editingEvent, banner_url: newUrl });
      } else {
        setFormData({ ...formData, banner_url: newUrl });
      }

      // Record uploaded file item
      const newItem: UploadedFileItem = {
        id: "file-" + Date.now(),
        name: file.name,
        url: res.url,
        bucket: "event-images",
        size: file.size,
        type: file.type,
        uploaded_at: new Date().toISOString(),
      };
      setUploadedFiles((prev) => [newItem, ...prev]);

      toast.success("Image uploaded to Supabase Storage!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploadingBanner(false);
    }
  };

  // Dedicated Storage Tab Upload Handler
  const handleStorageTabUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      const res = await uploadFileToSupabase(file, selectedBucket, "documents");
      const newItem: UploadedFileItem = {
        id: "file-" + Date.now(),
        name: file.name,
        url: res.url,
        bucket: selectedBucket,
        size: file.size,
        type: file.type,
        uploaded_at: new Date().toISOString(),
      };

      setUploadedFiles((prev) => [newItem, ...prev]);
      toast.success(`Uploaded ${file.name} to Supabase bucket "${selectedBucket}"!`);
    } catch (err: any) {
      toast.error(err.message || "File upload failed");
    } finally {
      setUploadingDoc(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    toast.success("URL copied to clipboard!");
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  // Create Event Action
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        start_at: new Date(formData.start_at).toISOString(),
        end_at: new Date(formData.end_at).toISOString(),
        registration_deadline: formData.registration_deadline
          ? new Date(formData.registration_deadline).toISOString()
          : null,
      };

      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create event");
      }

      toast.success("Event created and published in Supabase!");
      if (data.event) {
        setEvents((prev) => [data.event, ...prev]);
      }
      setActiveTab("events");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create event");
    } finally {
      setCreating(false);
    }
  };

  // Update Event Action
  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    setLoadingAction(`update-${editingEvent.id}`);
    try {
      const payload = {
        ...editingEvent,
        tags: typeof editingEvent.tags === "string" 
          ? editingEvent.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
          : editingEvent.tags,
      };

      const res = await fetch(`/api/admin/events/${editingEvent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setEvents((prev) =>
        prev.map((evt) => (evt.id === editingEvent.id ? { ...evt, ...payload } : evt))
      );
      toast.success("Event updated successfully!");
      setEditingEvent(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update event");
    } finally {
      setLoadingAction(null);
    }
  };

  // Toggle Approval / Feature Status
  const handleToggleApprove = async (eventId: string, currentApproved: boolean) => {
    setLoadingAction(`approve-${eventId}`);
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: !currentApproved }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, approved: !currentApproved } : e))
      );
      toast.success(!currentApproved ? "Event approved!" : "Event moved to pending");
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleToggleFeatured = async (eventId: string, currentFeatured: boolean) => {
    setLoadingAction(`feature-${eventId}`);
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !currentFeatured }),
      });
      if (!res.ok) throw new Error("Failed to update featured flag");
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, featured: !currentFeatured } : e))
      );
      toast.success(!currentFeatured ? "Event marked as Featured!" : "Event unfeatured");
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event from Supabase?")) return;
    setLoadingAction(`delete-${eventId}`);
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete event");
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      toast.success("Event deleted from Supabase");
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setLoadingAction(null);
    }
  };

  // Category Handlers
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create category");
      
      setLocalCategories((prev) => [...prev, data.category].sort((a, b) => a.sort_order - b.sort_order));
      toast.success("Category created!");
      setShowCategoryForm(false);
      setCategoryForm({ name: "", slug: "", description: "", icon: "more-horizontal", color: "#6366F1", sort_order: 0, is_active: true });
    } catch (err: any) {
      toast.error(err.message || "Failed to create category");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setLoadingAction(`update-cat-${editingCategory.id}`);
    try {
      const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCategory),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      
      setLocalCategories((prev) => prev.map((c) => (c.id === editingCategory.id ? { ...c, ...editingCategory } : c)).sort((a, b) => a.sort_order - b.sort_order));
      toast.success("Category updated!");
      setEditingCategory(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update category");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm("Are you sure? This will delete the category if no events are using it.")) return;
    setLoadingAction(`delete-cat-${catId}`);
    try {
      const res = await fetch(`/api/admin/categories/${catId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete category");
      
      setLocalCategories((prev) => prev.filter((c) => c.id !== catId));
      toast.success("Category deleted!");
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setLoadingAction(null);
    }
  };

  // Student Attendance Check-in
  const handleMarkAttended = async (regId: string) => {
    try {
      const res = await fetch(`/api/admin/registrations/${regId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "attended", checked_in: true }),
      });
      if (!res.ok) throw new Error("Failed to update attendance");
      setRegistrations((prev) =>
        prev.map((r) => (r.id === regId ? { ...r, status: "attended", checked_in: true } : r))
      );
      toast.success("Attendance marked!");
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    }
  };

  // Issue Certificate Action
  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIssuingCert(true);

    try {
      const res = await fetch("/api/admin/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(certForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to issue certificate");

      toast.success(`Certificate ${data.certificate.certificate_number} issued!`);
      setCertificates((prev) => [data.certificate, ...prev]);
      setCertForm((prev) => ({ ...prev, recipient_name: "", recipient_email: "" }));
    } catch (err: any) {
      toast.error(err.message || "Certificate issuance failed");
    } finally {
      setIssuingCert(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  // Filtered events
  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || e.category_id === categoryFilter || e.category_slug === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && !e.approved) ||
      (statusFilter === "published" && e.approved && e.status === "published") ||
      (statusFilter === "featured" && e.featured);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="container-page py-8">
      {/* Top Header */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { xs: "flex-start", md: "center" }, justifyContent: "space-between", gap: 2, pb: 4, mb: 4, borderBottom: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ width: 48, height: 48, backgroundColor: theme.palette.primary.main, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", boxShadow: theme.shadows[2] }}>
            <ShieldCheck size={28} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary", letterSpacing: "-0.02em" }}>
              Admin Control Center
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              Live Supabase Database & Storage: <Typography component="span" sx={{ color: theme.palette.primary.main, fontFamily: "monospace", fontWeight: 600 }}>Event_manger</Typography>
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            onClick={() => setActiveTab("storage")}
            variant="outlined"
            startIcon={<FolderUp size={16} />}
            sx={{ borderRadius: "10px", fontWeight: 600, color: "text.primary", borderColor: "divider" }}
          >
            Storage
          </Button>
          <Button
            onClick={() => setActiveTab("create")}
            variant="contained"
            color="primary"
            startIcon={<Plus size={16} />}
            sx={{ borderRadius: "10px", fontWeight: 600, boxShadow: theme.shadows[2] }}
          >
            Create Event
          </Button>
          <Button
            onClick={handleLogout}
            variant="text"
            color="inherit"
            startIcon={<LogOut size={16} />}
            sx={{ borderRadius: "10px", fontWeight: 600, color: "text.secondary" }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* 7 Stat Cards matching platform SQL fields */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 my-6">
        {[
          { label: "Total Events", value: events.length || stats.totalEvents, icon: Calendar, color: "#4f46e5", bg: "#eef2ff" },
          { label: "Live Now", value: stats.liveEvents, icon: Clock, color: "#e11d48", bg: "#fff1f2" },
          { label: "Registrations", value: registrations.length || stats.registrations, icon: Users, color: "#059669", bg: "#ecfdf5" },
          { label: "Attended", value: stats.attendance, icon: CheckCircle2, color: "#2563eb", bg: "#eff6ff" },
          { label: "Certificates", value: certificates.length || stats.certificates, icon: Award, color: "#d97706", bg: "#fffbeb" },
          { label: "Colleges", value: colleges.length || stats.colleges, icon: Building2, color: "#9333ea", bg: "#faf5ff" },
          { label: "Categories", value: categories.length || stats.categories, icon: Tag, color: "#0891b2", bg: "#ecfeff" },
        ].map((s) => (
          <Card key={s.label} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: "16px", backgroundColor: "white" }}>
            <CardContent sx={{ p: "16px !important", display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="overline" sx={{ fontWeight: 700, color: "text.secondary", lineHeight: 1 }}>{s.label}</Typography>
                <Box sx={{ width: 28, height: 28, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: s.bg, color: s.color }}>
                  <s.icon size={14} />
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary" }}>{s.value}</Typography>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4, overflowX: "auto" }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 48 }}
        >
          {[
            { id: "banners", label: "Banners", count: banners.length },
            { id: "services", label: "Services", count: services.length },
            { id: "events", label: "Events", count: events.length },
            { id: "create", label: "Create Event" },
            { id: "categories", label: "Categories", count: localCategories.length },
            { id: "storage", label: "Storage Uploads", count: uploadedFiles.length },
            { id: "colleges", label: "Partner Colleges", count: colleges.length },
            { id: "registrations", label: "Registrations", count: registrations.length },
            { id: "certificates", label: "Certificates", count: certificates.length },
          ].map((tab) => (
            <Tab
              key={tab.id}
              value={tab.id}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {tab.label}
                  {tab.count !== undefined && (
                    <Chip label={tab.count} size="small" sx={{ height: 20, fontSize: "0.6875rem", fontWeight: 700, ml: 0.5 }} />
                  )}
                </Box>
              }
              sx={{ fontWeight: 600, textTransform: "none", fontSize: "0.875rem", minHeight: 48 }}
            />
          ))}
        </Tabs>
      </Box>

      {/* TAB 1: EVENTS LIST & ACTIONS */}
      {activeTab === "events" && (
        <div>
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search events by title, venue, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="pending">Pending Approval</option>
                <option value="featured">Featured Only</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Event Details</th>
                    <th className="py-3 px-4">Category & College</th>
                    <th className="py-3 px-4">Mode / Venue</th>
                    <th className="py-3 px-4">Dates</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden relative flex-shrink-0">
                            {evt.banner_url ? (
                              <img src={evt.banner_url} alt={evt.title} className="w-full h-full object-cover" />
                            ) : (
                              <Calendar className="w-5 h-5 text-slate-400 absolute inset-0 m-auto" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="font-semibold text-slate-900 truncate">{evt.title}</p>
                            <p className="text-[11px] text-slate-400 font-mono truncate">/{evt.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800">
                          {evt.categories?.name || evt.category_name || "General"}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {evt.colleges?.name || evt.college_name || "Host College"}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium uppercase text-[10px]">
                          {evt.mode || "offline"}
                        </span>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{evt.venue || evt.city || "Campus Auditorium"}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <p>{formatDate(evt.start_at, "MMM d, yyyy")}</p>
                        <p className="text-[11px] text-slate-400">{formatDate(evt.start_at, "h:mm a")}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {evt.approved ? (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-medium rounded-full text-[10px] flex items-center gap-1">
                              <Check className="w-3 h-3" /> Approved
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-medium rounded-full text-[10px] flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                          {evt.featured && (
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-medium rounded-full text-[10px] flex items-center gap-1">
                              <Star className="w-3 h-3 fill-purple-600" /> Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/events/${evt.slug}`}
                            target="_blank"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                            title="View Public Event Page"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => setEditingEvent(evt)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors cursor-pointer"
                            title="Edit Event Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleApprove(evt.id, evt.approved)}
                            disabled={loadingAction === `approve-${evt.id}`}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              evt.approved
                                ? "bg-amber-100 hover:bg-amber-200 text-amber-700"
                                : "bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
                            }`}
                            title={evt.approved ? "Move to Pending" : "Approve Event"}
                          >
                            {loadingAction === `approve-${evt.id}` ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : evt.approved ? (
                              <X className="w-3.5 h-3.5" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleToggleFeatured(evt.id, evt.featured)}
                            disabled={loadingAction === `feature-${evt.id}`}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              evt.featured
                                ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                                : "bg-slate-100 text-slate-400 hover:text-purple-600"
                            }`}
                            title={evt.featured ? "Remove Featured" : "Mark Featured"}
                          >
                            <Star className={`w-3.5 h-3.5 ${evt.featured ? "fill-purple-600" : ""}`} />
                          </button>

                          <button
                            onClick={() => handleDeleteEvent(evt.id)}
                            disabled={loadingAction === `delete-${evt.id}`}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete from Supabase"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredEvents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No events match the criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CREATE EVENT FORM MATCHING 100% SQL DB SCHEMA */}
      {activeTab === "create" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Publish New Event to Supabase</h2>
            <p className="text-xs text-slate-500 mt-1">
              Every field matches the frontend design and writes directly into your <code className="font-mono text-primary-600">events</code> table.
            </p>
          </div>

          <form onSubmit={handleCreateEvent} className="space-y-5 text-xs">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HackIndia 2026: AI & Web3 Sprint"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  URL Slug * (auto-generated)
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500 font-mono"
                />
              </div>
            </div>

            {/* Category & College */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Host College *
                </label>
                <select
                  value={formData.college_id}
                  onChange={(e) => setFormData({ ...formData, college_id: e.target.value })}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500"
                >
                  {colleges.map((col) => (
                    <option key={col.id} value={col.id}>{col.name} ({col.city || "Campus"})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Organizer Name
                </label>
                <input
                  type="text"
                  value={formData.organizer_name}
                  onChange={(e) => setFormData({ ...formData, organizer_name: e.target.value })}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Short Description (Cards & Previews)
              </label>
              <input
                type="text"
                placeholder="Punchy 1-sentence overview for discovery cards..."
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500"
              />
            </div>

            {/* Full Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Detailed Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Complete agenda, track info, keynote speakers..."
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500"
              />
            </div>

            {/* Mode, Venue, Meeting URL */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mode *
                </label>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value as any })}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500"
                >
                  <option value="offline">In-Person (Offline)</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Venue / Hall
                </label>
                <input
                  type="text"
                  placeholder="Main Auditorium, Lab B"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Meeting URL (If Online / Hybrid)
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={formData.meeting_url}
                  onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            {/* Dates & Deadlines */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.start_at}
                  onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.end_at}
                  onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Registration Deadline
                </label>
                <input
                  type="datetime-local"
                  value={formData.registration_deadline}
                  onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            {/* Capacity, Prize Info, Banner Image with Supabase Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Max Capacity (Seats)
                </label>
                <input
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) || 0 })}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Prize Pool Info
                </label>
                <input
                  type="text"
                  placeholder="₹2,00,000 Cash Pool"
                  value={formData.prize_info}
                  onChange={(e) => setFormData({ ...formData, prize_info: e.target.value })}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Banner Image (Upload or URL)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.banner_url}
                    onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500"
                  />
                  <label className="px-3 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shrink-0 text-xs font-semibold shadow-xs">
                    {uploadingBanner ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleBannerUpload(e, false)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Banner Preview if present */}
            {formData.banner_url && (
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-4">
                <img src={formData.banner_url} alt="Banner Preview" className="w-24 h-14 object-cover rounded-xl border border-slate-200" />
                <div>
                  <p className="text-xs font-semibold text-slate-900">Live Banner Preview</p>
                  <p className="text-[11px] text-slate-400 font-mono truncate max-w-md">{formData.banner_url}</p>
                </div>
              </div>
            )}

            {/* Tags & Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="AI/ML, Hackathon, Web3, Cash Prize"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="flex items-center gap-6 pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.has_certificate}
                    onChange={(e) => setFormData({ ...formData, has_certificate: e.target.checked })}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="font-medium text-slate-800">Issue Verified Certificates</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="font-medium text-slate-800">Feature on Hero Banner</span>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("events")}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-primary-500/25 flex items-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Publish Event Directly to Supabase
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: SUPABASE STORAGE UPLOADS & DOCUMENTS */}
      {activeTab === "storage" && (
        <div className="space-y-6">
          {/* File Upload Zone */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-primary-600" />
                  <h2 className="text-lg font-bold text-slate-900">Supabase Storage File Manager</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Upload event posters, rulebooks, brochures, schedules, and certificate templates directly into your Supabase Storage buckets.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">Select Bucket:</label>
                <select
                  value={selectedBucket}
                  onChange={(e) => setSelectedBucket(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="dinesh_project">dinesh_project</option>
                  <option value="event-images">event-images</option>
                  <option value="documents">documents</option>
                  <option value="certificates">certificates</option>
                </select>
              </div>
            </div>

            {/* Drop / Select Zone */}
            <div className="mt-6 border-2 border-dashed border-primary-200 bg-primary-50/40 hover:bg-primary-50/80 transition-colors rounded-2xl p-8 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary-600 shadow-md mb-3">
                {uploadingDoc ? <Loader2 className="w-7 h-7 animate-spin" /> : <FolderUp className="w-7 h-7" />}
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                {uploadingDoc ? "Uploading File to Supabase..." : `Upload File to Bucket "${selectedBucket}"`}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                Supports JPEG, PNG, WebP, SVG, PDF, DOCX, and TXT files up to 10MB per file.
              </p>

              <label className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-primary-500/25 transition">
                <Upload className="w-4 h-4" />
                <span>Choose File to Upload</span>
                <input
                  type="file"
                  onChange={handleStorageTabUpload}
                  disabled={uploadingDoc}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Uploaded Files Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm">Uploaded Assets & Documents</h2>
              <span className="text-xs text-slate-500">{uploadedFiles.length} files in storage</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">File Name & Preview</th>
                    <th className="py-3 px-4">Bucket</th>
                    <th className="py-3 px-4">File Size</th>
                    <th className="py-3 px-4">Upload Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {uploadedFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                            {file.type.startsWith("image/") ? (
                              <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                            ) : (
                              <FileText className="w-5 h-5 text-primary-600" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="font-semibold text-slate-900 truncate">{file.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">{file.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                          {file.bucket}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {formatDate(file.uploaded_at, "MMM d, yyyy")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => copyToClipboard(file.url)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium flex items-center gap-1 cursor-pointer transition"
                            title="Copy Public URL"
                          >
                            {copiedUrl === file.url ? (
                              <>
                                <CheckCheck className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700 font-semibold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>

                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-[11px] font-medium flex items-center gap-1 transition"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Open</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {uploadedFiles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        No files uploaded yet. Select a file above to upload to Supabase Storage.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PARTNER COLLEGES & ORGANIZERS */}
      {activeTab === "colleges" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Registered Host Colleges & Universities</h2>
                <p className="text-xs text-slate-500">Official institutions hosting events on EduEvents</p>
              </div>
              <span className="px-3 py-1 bg-primary-50 text-primary-700 border border-primary-100 rounded-full text-xs font-semibold">
                {colleges.length} Verified Institutions
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {colleges.map((col) => (
                <div key={col.id} className="p-4 border border-slate-200/80 rounded-xl bg-slate-50/50 hover:bg-white transition-all shadow-xs">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700 font-bold">
                      <School className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs line-clamp-1">{col.name}</h3>
                      <p className="text-[11px] text-slate-400">{col.city || "India"}</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span>Verified Host</span>
                    <span className="font-mono text-emerald-600 font-semibold">Active ✓</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STUDENT REGISTRATIONS */}
      {activeTab === "registrations" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">Customer & Student Registrations</h2>
            <span className="text-xs text-slate-500">{registrations.length} total signups</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Pass Number</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Email & Phone</th>
                  <th className="py-3 px-4">College</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-primary-600">
                      {reg.registration_number || `REG-${reg.id.slice(0, 6)}`}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{reg.full_name || reg.name || "Student"}</td>
                    <td className="py-3 px-4">
                      <p className="text-slate-800">{reg.email}</p>
                      <p className="text-slate-400 text-[11px]">{reg.phone || "—"}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{reg.college_name || "—"}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium max-w-xs truncate">
                      {reg.events?.title || reg.event_title || "Event Registration"}
                    </td>
                    <td className="py-3 px-4">
                      {reg.checked_in || reg.status === "attended" ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-medium text-[10px]">
                          Attended
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium text-[10px]">
                          Registered
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!(reg.checked_in || reg.status === "attended") && (
                        <button
                          onClick={() => handleMarkAttended(reg.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Check In
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {registrations.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      No registrations recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: CERTIFICATES ISSUANCE & REGISTRY */}
      {activeTab === "certificates" && (
        <div className="space-y-6">
          {/* Issue Certificate Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-slate-900 text-sm">Issue New Event Certificate</h2>
                <p className="text-xs text-slate-500">Generate verifiable certificate directly into Supabase database</p>
              </div>
              <Link
                href="/verify/check"
                target="_blank"
                className="text-xs text-primary-600 hover:underline flex items-center gap-1 font-semibold"
              >
                Open Public Verifier <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <form onSubmit={handleIssueCertificate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Participant Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={certForm.recipient_name}
                    onChange={(e) => setCertForm({ ...certForm, recipient_name: e.target.value })}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Participant Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="aarav@example.com"
                    value={certForm.recipient_email}
                    onChange={(e) => setCertForm({ ...certForm, recipient_email: e.target.value })}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={certForm.event_title}
                    onChange={(e) => setCertForm({ ...certForm, event_title: e.target.value })}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">College Name</label>
                  <input
                    type="text"
                    value={certForm.college_name}
                    onChange={(e) => setCertForm({ ...certForm, college_name: e.target.value })}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={issuingCert}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs transition disabled:opacity-60 cursor-pointer"
                >
                  {issuingCert ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Issue Certificate</span>
                </button>
              </div>
            </form>
          </div>

          {/* Certificates Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm">Issued Certificates Registry</h2>
              <span className="text-xs text-slate-500">{certificates.length} total issued</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Certificate ID</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">College</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4 text-right">Verify</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {certificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary-600">
                        {cert.certificate_number}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{cert.recipient_name}</p>
                        <p className="text-[11px] text-slate-400">{cert.recipient_email}</p>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{cert.event_title}</td>
                      <td className="py-3 px-4 text-slate-600">{cert.college_name || "—"}</td>
                      <td className="py-3 px-4 text-slate-500">{cert.issue_date || cert.created_at?.slice(0, 10)}</td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/verify/${cert.certificate_number}`}
                          target="_blank"
                          className="px-2.5 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium rounded-lg text-[11px] inline-flex items-center gap-1"
                        >
                          Verify <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {certificates.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No certificates generated yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Edit Event Details</h3>
              <button
                onClick={() => setEditingEvent(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingEvent.category_id}
                    onChange={(e) => setEditingEvent({ ...editingEvent, category_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mode</label>
                  <select
                    value={editingEvent.mode || "offline"}
                    onChange={(e) => setEditingEvent({ ...editingEvent, mode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="offline">In-Person</option>
                    <option value="online">Online</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Venue / City</label>
                <input
                  type="text"
                  value={editingEvent.venue || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prize Info</label>
                <input
                  type="text"
                  value={editingEvent.prize_info || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, prize_info: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Banner Image (Upload or URL)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={editingEvent.banner_url || ""}
                    onChange={(e) => setEditingEvent({ ...editingEvent, banner_url: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                  <label className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shrink-0 text-xs font-semibold shadow-xs">
                    {uploadingBanner ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleBannerUpload(e, true)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {editingEvent.banner_url && (
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                  <img src={editingEvent.banner_url} alt="Preview" className="w-16 h-10 object-cover rounded-lg border" />
                  <p className="text-[10px] text-slate-500 font-mono truncate">{editingEvent.banner_url}</p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction === `update-${editingEvent.id}`}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {loadingAction === `update-${editingEvent.id}` ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : null}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== TAB: BANNERS MANAGEMENT ===== */}
      {activeTab === "banners" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Banner Management</h2>
              <p className="text-xs text-slate-500 mt-0.5">Upload images to Supabase Storage, save URLs to database. Customer app displays active banners.</p>
            </div>
            <button
              onClick={() => { setShowBannerForm(true); setEditingBanner(null); setBannerForm({ title: "", subtitle: "", image_path: "", cta_text: "", cta_action: "", is_active: true, sort_order: 0, start_date: "", end_date: "" }); }}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Banner
            </button>
          </div>

          {/* Banner Create / Edit Form */}
          {(showBannerForm || editingBanner) && (
            <div className="mb-8 bg-white border border-blue-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">{editingBanner ? "Edit Banner" : "Add New Banner"}</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formPayload = editingBanner ? { ...editingBanner } : { ...bannerForm };
                  if (!formPayload.image_path) { toast.error("Please upload a banner image first."); return; }
                  setLoadingAction("banner-save");
                  try {
                    if (editingBanner) {
                      const res = await fetch(`/api/admin/banners/${editingBanner.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formPayload) });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error);
                      setBanners(prev => prev.map(b => b.id === editingBanner.id ? data.banner : b));
                      toast.success("Banner updated!");
                    } else {
                      const res = await fetch("/api/admin/banners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formPayload) });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error);
                      setBanners(prev => [data.banner, ...prev]);
                      toast.success("Banner created!");
                    }
                    setShowBannerForm(false); setEditingBanner(null);
                  } catch (err: any) { toast.error(err.message || "Save failed"); }
                  finally { setLoadingAction(null); }
                }}
                className="space-y-4 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                    <input required type="text" placeholder="e.g. Summer Cleaning Offer" value={editingBanner ? editingBanner.title : bannerForm.title}
                      onChange={e => editingBanner ? setEditingBanner({...editingBanner, title: e.target.value}) : setBannerForm({...bannerForm, title: e.target.value})}
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Subtitle</label>
                    <input type="text" placeholder="e.g. 20% OFF this weekend" value={editingBanner ? editingBanner.subtitle || "" : bannerForm.subtitle}
                      onChange={e => editingBanner ? setEditingBanner({...editingBanner, subtitle: e.target.value}) : setBannerForm({...bannerForm, subtitle: e.target.value})}
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500" />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Banner Image *</label>
                  <div className="flex items-center gap-3">
                    <label className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                      uploadingBanner ? "bg-slate-200 text-slate-500" : "bg-primary-600 hover:bg-primary-700 text-white"
                    }`}>
                      {uploadingBanner ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      {uploadingBanner ? "Uploading..." : "Upload Image"}
                      <input type="file" accept="image/*" disabled={uploadingBanner} className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]; if (!file) return;
                          setUploadingBanner(true);
                          try {
                            const fd = new FormData(); fd.append("file", file); fd.append("bucket", "dinesh_project"); fd.append("folder", "banners");
                            const res = await fetch("/api/upload", { method: "POST", body: fd });
                            const data = await res.json(); if (!res.ok) throw new Error(data.error);
                            editingBanner ? setEditingBanner({...editingBanner, image_path: data.url}) : setBannerForm({...bannerForm, image_path: data.url});
                            toast.success("Image uploaded!");
                          } catch (err: any) { toast.error(err.message || "Upload failed"); }
                          finally { setUploadingBanner(false); }
                        }}
                      />
                    </label>
                    {(editingBanner?.image_path || bannerForm.image_path) && (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <img src={editingBanner?.image_path || bannerForm.image_path} alt="Preview" className="w-16 h-10 object-cover rounded-lg border border-slate-200" />
                        <p className="text-[10px] text-slate-500 font-mono truncate flex-1">{editingBanner?.image_path || bannerForm.image_path}</p>
                        <button type="button" className="text-rose-500 hover:text-rose-700 text-xs cursor-pointer"
                          onClick={() => editingBanner ? setEditingBanner({...editingBanner, image_path: ""}) : setBannerForm({...bannerForm, image_path: ""})}>
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {!(editingBanner?.image_path || bannerForm.image_path) && (
                      <p className="text-[11px] text-slate-400">No image selected. Upload required before saving.</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">CTA Button Text</label>
                    <input type="text" placeholder="e.g. Book Now" value={editingBanner ? editingBanner.cta_text || "" : bannerForm.cta_text}
                      onChange={e => editingBanner ? setEditingBanner({...editingBanner, cta_text: e.target.value}) : setBannerForm({...bannerForm, cta_text: e.target.value})}
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Sort Order</label>
                    <input type="number" min={0} value={editingBanner ? editingBanner.sort_order : bannerForm.sort_order}
                      onChange={e => editingBanner ? setEditingBanner({...editingBanner, sort_order: Number(e.target.value)}) : setBannerForm({...bannerForm, sort_order: Number(e.target.value)})}
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500" />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input type="checkbox" id="banner-active" checked={editingBanner ? editingBanner.is_active : bannerForm.is_active}
                      onChange={e => editingBanner ? setEditingBanner({...editingBanner, is_active: e.target.checked}) : setBannerForm({...bannerForm, is_active: e.target.checked})}
                      className="w-4 h-4 accent-primary-600" />
                    <label htmlFor="banner-active" className="text-xs font-semibold text-slate-700">Active (visible to customers)</label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Start Date (optional)</label>
                    <input type="datetime-local" value={editingBanner ? editingBanner.start_date || "" : bannerForm.start_date}
                      onChange={e => editingBanner ? setEditingBanner({...editingBanner, start_date: e.target.value}) : setBannerForm({...bannerForm, start_date: e.target.value})}
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">End Date (optional)</label>
                    <input type="datetime-local" value={editingBanner ? editingBanner.end_date || "" : bannerForm.end_date}
                      onChange={e => editingBanner ? setEditingBanner({...editingBanner, end_date: e.target.value}) : setBannerForm({...bannerForm, end_date: e.target.value})}
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500" />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button type="button" onClick={() => { setShowBannerForm(false); setEditingBanner(null); }}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-200">
                    Cancel
                  </button>
                  <button type="submit" disabled={loadingAction === "banner-save"}
                    className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer">
                    {loadingAction === "banner-save" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {editingBanner ? "Update Banner" : "Save Banner"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Banners Grid */}
          {banners.length === 0 && !showBannerForm && (
            <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
              <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">No banners yet</p>
              <p className="text-xs text-slate-400 mt-1">Click "Add Banner" to upload your first banner image.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {banners.map((banner) => (
              <div key={banner.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {banner.image_path ? (
                  <div className="h-40 bg-slate-100 overflow-hidden">
                    <img src={banner.image_path} alt={banner.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-40 bg-slate-100 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{banner.title}</p>
                      {banner.subtitle && <p className="text-xs text-slate-500 truncate">{banner.subtitle}</p>}
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                      banner.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}>{banner.is_active ? "Active" : "Inactive"}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Sort: {banner.sort_order}</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => { setEditingBanner(banner); setShowBannerForm(false); }}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors cursor-pointer" title="Edit">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm("Delete this banner?")) return;
                          setLoadingAction(`del-banner-${banner.id}`);
                          try {
                            const res = await fetch(`/api/admin/banners/${banner.id}`, { method: "DELETE" });
                            if (!res.ok) throw new Error("Delete failed");
                            setBanners(prev => prev.filter(b => b.id !== banner.id));
                            toast.success("Banner deleted!");
                          } catch (err: any) { toast.error(err.message); }
                          finally { setLoadingAction(null); }
                        }}
                        disabled={loadingAction === `del-banner-${banner.id}`}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer" title="Delete">
                        {loadingAction === `del-banner-${banner.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== TAB: SERVICES MANAGEMENT ===== */}
      {activeTab === "services" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Service Management</h2>
              <p className="text-xs text-slate-500 mt-0.5">Manage services like Cleaning, Plumber, AC Service etc. Customer app fetches these dynamically.</p>
            </div>
            <button
              onClick={() => { setShowServiceForm(true); setEditingService(null); setServiceForm({ category_id: categories[0]?.id || "", name: "", description: "", price: "", discount_price: "", duration_minutes: 60, image_path: "", is_active: true, sort_order: 0 }); }}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Service
            </button>
          </div>

          {/* Service Create / Edit Form */}
          {(showServiceForm || editingService) && (
            <div className="mb-8 bg-white border border-blue-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">{editingService ? "Edit Service" : "Add New Service"}</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formPayload = editingService
                    ? { ...editingService, price: Number(editingService.price), discount_price: editingService.discount_price ? Number(editingService.discount_price) : null }
                    : { ...serviceForm, price: Number(serviceForm.price), discount_price: serviceForm.discount_price ? Number(serviceForm.discount_price) : null };
                  setLoadingAction("service-save");
                  try {
                    if (editingService) {
                      const res = await fetch(`/api/admin/services/${editingService.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formPayload) });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error);
                      setServices(prev => prev.map(s => s.id === editingService.id ? data.service : s));
                      toast.success("Service updated!");
                    } else {
                      const res = await fetch("/api/admin/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formPayload) });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error);
                      setServices(prev => [data.service, ...prev]);
                      toast.success("Service created!");
                    }
                    setShowServiceForm(false); setEditingService(null);
                  } catch (err: any) { toast.error(err.message || "Save failed"); }
                  finally { setLoadingAction(null); }
                }}
                className="space-y-4 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Service Name *</label>
                    <input required type="text" placeholder="e.g. Deep Home Cleaning" value={editingService ? editingService.name : serviceForm.name}
                      onChange={e => editingService ? setEditingService({...editingService, name: e.target.value}) : setServiceForm({...serviceForm, name: e.target.value})}
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                    <select value={editingService ? editingService.category_id || "" : serviceForm.category_id}
                      onChange={e => editingService ? setEditingService({...editingService, category_id: e.target.value}) : setServiceForm({...serviceForm, category_id: e.target.value})}
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500">
                      <option value="">No Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea rows={3} placeholder="Describe the service..." value={editingService ? editingService.description || "" : serviceForm.description}
                    onChange={e => editingService ? setEditingService({...editingService, description: e.target.value}) : setServiceForm({...serviceForm, description: e.target.value})}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500 resize-none" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Price (₹) *</label>
                    <input required type="number" min={0} step="0.01" placeholder="499" value={editingService ? editingService.price : serviceForm.price}
                      onChange={e => editingService ? setEditingService({...editingService, price: e.target.value}) : setServiceForm({...serviceForm, price: e.target.value})}
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Discount (₹)</label>
                    <input type="number" min={0} step="0.01" placeholder="399" value={editingService ? editingService.discount_price || "" : serviceForm.discount_price}
                      onChange={e => editingService ? setEditingService({...editingService, discount_price: e.target.value}) : setServiceForm({...serviceForm, discount_price: e.target.value})}
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Duration (min)</label>
                    <input type="number" min={0} value={editingService ? editingService.duration_minutes : serviceForm.duration_minutes}
                      onChange={e => editingService ? setEditingService({...editingService, duration_minutes: Number(e.target.value)}) : setServiceForm({...serviceForm, duration_minutes: Number(e.target.value)})}
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Sort Order</label>
                    <input type="number" min={0} value={editingService ? editingService.sort_order : serviceForm.sort_order}
                      onChange={e => editingService ? setEditingService({...editingService, sort_order: Number(e.target.value)}) : setServiceForm({...serviceForm, sort_order: Number(e.target.value)})}
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary-500" />
                  </div>
                </div>

                {/* Service Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Service Image</label>
                  <div className="flex items-center gap-3">
                    <label className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                      uploadingServiceImg ? "bg-slate-200 text-slate-500" : "bg-primary-600 hover:bg-primary-700 text-white"
                    }`}>
                      {uploadingServiceImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      {uploadingServiceImg ? "Uploading..." : "Upload Image"}
                      <input type="file" accept="image/*" disabled={uploadingServiceImg} className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]; if (!file) return;
                          setUploadingServiceImg(true);
                          try {
                            const fd = new FormData(); fd.append("file", file); fd.append("bucket", "dinesh_project"); fd.append("folder", "services");
                            const res = await fetch("/api/upload", { method: "POST", body: fd });
                            const data = await res.json(); if (!res.ok) throw new Error(data.error);
                            editingService ? setEditingService({...editingService, image_path: data.url}) : setServiceForm({...serviceForm, image_path: data.url});
                            toast.success("Image uploaded!");
                          } catch (err: any) { toast.error(err.message || "Upload failed"); }
                          finally { setUploadingServiceImg(false); }
                        }}
                      />
                    </label>
                    {(editingService?.image_path || serviceForm.image_path) && (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <img src={editingService?.image_path || serviceForm.image_path} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                        <p className="text-[10px] text-slate-500 font-mono truncate flex-1">{editingService?.image_path || serviceForm.image_path}</p>
                        <button type="button" className="text-rose-500 hover:text-rose-700 cursor-pointer"
                          onClick={() => editingService ? setEditingService({...editingService, image_path: ""}) : setServiceForm({...serviceForm, image_path: ""})}>
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="service-active" checked={editingService ? editingService.is_active : serviceForm.is_active}
                    onChange={e => editingService ? setEditingService({...editingService, is_active: e.target.checked}) : setServiceForm({...serviceForm, is_active: e.target.checked})}
                    className="w-4 h-4 accent-primary-600" />
                  <label htmlFor="service-active" className="text-xs font-semibold text-slate-700">Active (visible to customers)</label>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button type="button" onClick={() => { setShowServiceForm(false); setEditingService(null); }}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-200">
                    Cancel
                  </button>
                  <button type="submit" disabled={loadingAction === "service-save"}
                    className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer">
                    {loadingAction === "service-save" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {editingService ? "Update Service" : "Save Service"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Services Table */}
          {services.length === 0 && !showServiceForm && (
            <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
              <Tag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">No services yet</p>
              <p className="text-xs text-slate-400 mt-1">Click "Add Service" to create your first service listing.</p>
            </div>
          )}

          {services.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {services.map(svc => (
                      <tr key={svc.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                              {svc.image_path ? (
                                <img src={svc.image_path} alt={svc.name} className="w-full h-full object-cover" />
                              ) : (
                                <Tag className="w-4 h-4 text-slate-400 m-auto mt-3" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate">{svc.name}</p>
                              {svc.description && <p className="text-[11px] text-slate-400 truncate max-w-xs">{svc.description}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{svc.categories?.name || "Uncategorized"}</td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900">₹{svc.price}</span>
                          {svc.discount_price && <span className="ml-1.5 text-emerald-600 font-semibold">₹{svc.discount_price}</span>}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{svc.duration_minutes} min</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                            svc.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                          }`}>{svc.is_active ? "Active" : "Inactive"}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => { setEditingService(svc); setShowServiceForm(false); }}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors cursor-pointer" title="Edit">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                const newStatus = !svc.is_active;
                                setLoadingAction(`toggle-svc-${svc.id}`);
                                try {
                                  const res = await fetch(`/api/admin/services/${svc.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: newStatus }) });
                                  if (!res.ok) throw new Error("Failed");
                                  setServices(prev => prev.map(s => s.id === svc.id ? { ...s, is_active: newStatus } : s));
                                  toast.success(newStatus ? "Service enabled" : "Service disabled");
                                } catch (err: any) { toast.error(err.message); }
                                finally { setLoadingAction(null); }
                              }}
                              disabled={loadingAction === `toggle-svc-${svc.id}`}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                svc.is_active ? "bg-amber-50 hover:bg-amber-100 text-amber-600" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                              }`} title={svc.is_active ? "Disable" : "Enable"}>
                              {loadingAction === `toggle-svc-${svc.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : svc.is_active ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm(`Delete service "${svc.name}"?`)) return;
                                setLoadingAction(`del-svc-${svc.id}`);
                                try {
                                  const res = await fetch(`/api/admin/services/${svc.id}`, { method: "DELETE" });
                                  if (!res.ok) throw new Error("Delete failed");
                                  setServices(prev => prev.filter(s => s.id !== svc.id));
                                  toast.success("Service deleted!");
                                } catch (err: any) { toast.error(err.message); }
                                finally { setLoadingAction(null); }
                              }}
                              disabled={loadingAction === `del-svc-${svc.id}`}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer" title="Delete">
                              {loadingAction === `del-svc-${svc.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: CATEGORIES */}
      {activeTab === "categories" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Category Management</h2>
              <p className="text-sm text-slate-500 mt-1">Add, edit, or remove event categories from the homepage.</p>
            </div>
            <button
              onClick={() => {
                setEditingCategory(null);
                setCategoryForm({ name: "", slug: "", description: "", icon: "more-horizontal", color: "#6366F1", sort_order: 0, is_active: true });
                setShowCategoryForm(true);
              }}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-sm text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>

          {(showCategoryForm || editingCategory) && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-8 relative">
              <button
                onClick={() => { setShowCategoryForm(false); setEditingCategory(null); }}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">{editingCategory ? "Edit Category" : "Create Category"}</h2>
              </div>

              <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory} className="space-y-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Category Name *</label>
                    <input
                      type="text"
                      required
                      value={editingCategory ? editingCategory.name : categoryForm.name}
                      onChange={(e) => editingCategory 
                        ? setEditingCategory({ ...editingCategory, name: e.target.value })
                        : handleCategoryNameChange(e.target.value)
                      }
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Slug *</label>
                    <input
                      type="text"
                      required
                      value={editingCategory ? editingCategory.slug : categoryForm.slug}
                      onChange={(e) => editingCategory 
                        ? setEditingCategory({ ...editingCategory, slug: e.target.value })
                        : setCategoryForm({ ...categoryForm, slug: e.target.value })
                      }
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <input
                    type="text"
                    value={editingCategory ? (editingCategory.description || "") : categoryForm.description}
                    onChange={(e) => editingCategory 
                      ? setEditingCategory({ ...editingCategory, description: e.target.value })
                      : setCategoryForm({ ...categoryForm, description: e.target.value })
                    }
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-primary-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Icon (Lucide name)</label>
                    <input
                      type="text"
                      placeholder="e.g. cpu, code-2, trophy"
                      value={editingCategory ? editingCategory.icon : categoryForm.icon}
                      onChange={(e) => editingCategory 
                        ? setEditingCategory({ ...editingCategory, icon: e.target.value })
                        : setCategoryForm({ ...categoryForm, icon: e.target.value })
                      }
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:border-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Color (Hex)</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={editingCategory ? editingCategory.color : categoryForm.color}
                        onChange={(e) => editingCategory 
                          ? setEditingCategory({ ...editingCategory, color: e.target.value })
                          : setCategoryForm({ ...categoryForm, color: e.target.value })
                        }
                        className="h-11 w-11 p-1 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                      />
                      <input
                        type="text"
                        value={editingCategory ? editingCategory.color : categoryForm.color}
                        onChange={(e) => editingCategory 
                          ? setEditingCategory({ ...editingCategory, color: e.target.value })
                          : setCategoryForm({ ...categoryForm, color: e.target.value })
                        }
                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:border-primary-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Sort Order</label>
                    <input
                      type="number"
                      value={editingCategory ? editingCategory.sort_order : categoryForm.sort_order}
                      onChange={(e) => editingCategory 
                        ? setEditingCategory({ ...editingCategory, sort_order: parseInt(e.target.value) || 0 })
                        : setCategoryForm({ ...categoryForm, sort_order: parseInt(e.target.value) || 0 })
                      }
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => { setShowCategoryForm(false); setEditingCategory(null); }}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || loadingAction?.startsWith("update-cat-")}
                    className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                  >
                    {(creating || loadingAction?.startsWith("update-cat-")) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingCategory ? "Save Changes" : "Create Category"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Category Details</th>
                    <th className="py-3 px-4 text-center">Sort Order</th>
                    <th className="py-3 px-4 text-center">Events</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {localCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                          >
                            <span className="font-bold uppercase">{cat.icon.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{cat.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">/{cat.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-600">{cat.sort_order}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded-full">
                          {cat.event_count || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                          cat.is_active !== false ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}>{cat.is_active !== false ? "Active" : "Inactive"}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setEditingCategory(cat); setShowCategoryForm(false); }}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={async () => {
                              const newStatus = cat.is_active === false ? true : false;
                              setLoadingAction(`toggle-cat-${cat.id}`);
                              try {
                                const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: newStatus }) });
                                if (!res.ok) throw new Error("Failed");
                                setLocalCategories(prev => prev.map(c => c.id === cat.id ? { ...c, is_active: newStatus } : c));
                                toast.success(newStatus ? "Category activated" : "Category deactivated");
                              } catch (err: any) { toast.error(err.message); }
                              finally { setLoadingAction(null); }
                            }}
                            disabled={loadingAction === `toggle-cat-${cat.id}`}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              cat.is_active !== false ? "bg-amber-50 hover:bg-amber-100 text-amber-600" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                            }`} title={cat.is_active !== false ? "Deactivate" : "Activate"}>
                            {loadingAction === `toggle-cat-${cat.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : cat.is_active !== false ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            disabled={loadingAction === `delete-cat-${cat.id}`}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {localCategories.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        No categories found. Create one above!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
