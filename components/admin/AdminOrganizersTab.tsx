"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, Globe, Linkedin, Instagram, User, Mail, Phone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "./ImageUpload";
import Image from "next/image";

interface AdminOrganizersTabProps {
  organizers: any[];
  setOrganizers: React.Dispatch<React.SetStateAction<any[]>>;
}

export function AdminOrganizersTab({ organizers, setOrganizers }: AdminOrganizersTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingOrganizer, setEditingOrganizer] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormState = {
    name: "",
    photo_url: "",
    organization_name: "",
    college_name: "",
    designation: "",
    email: "",
    phone: "",
    website: "",
    linkedin: "",
    instagram: "",
    description: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleEdit = (org: any) => {
    setFormData(org);
    setEditingOrganizer(org);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this organizer?")) return;

    try {
      const res = await fetch(`/api/admin/organizers/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete organizer");
      }

      setOrganizers((prev) => prev.filter((o) => o.id !== id));
      toast.success("Organizer deleted successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const isEditing = !!editingOrganizer;
      const url = isEditing 
        ? `/api/admin/organizers/${editingOrganizer.id}` 
        : "/api/admin/organizers";
        
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save organizer");
      }

      if (isEditing) {
        setOrganizers((prev) =>
          prev.map((o) => (o.id === editingOrganizer.id ? data.organizer : o))
        );
        toast.success("Organizer updated successfully");
      } else {
        setOrganizers((prev) => [data.organizer, ...prev]);
        toast.success("Organizer created successfully");
      }

      setShowForm(false);
      setFormData(initialFormState);
      setEditingOrganizer(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOrganizers = organizers.filter(
    (o) =>
      o.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.organization_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.college_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showForm) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            {editingOrganizer ? "Edit Organizer Profile" : "Create New Organizer"}
          </h2>
          <button
            onClick={() => {
              setShowForm(false);
              setFormData(initialFormState);
              setEditingOrganizer(null);
            }}
            className="text-sm font-semibold text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 space-y-4">
              <label className="block text-sm font-semibold text-slate-700">Profile Photo / Logo</label>
              <ImageUpload
                value={formData.photo_url || ""}
                onChange={(url) => setFormData({ ...formData, photo_url: url })}
                folder="organizer-images"
                defaultInitials={formData.name ? formData.name.substring(0, 2).toUpperCase() : ""}
              />
              <p className="text-xs text-slate-500">
                Recommended size: 400x400px. Used on event detail pages to represent the organizer.
              </p>
            </div>
            
            <div className="w-full md:w-2/3 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Organizer Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Rahul Sharma or Tech Club"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation || ""}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="e.g. President or Organizer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Organization / Club Name</label>
                  <input
                    type="text"
                    value={formData.organization_name || ""}
                    onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="e.g. ACM Student Chapter"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">College / University</label>
                  <input
                    type="text"
                    value={formData.college_name || ""}
                    onChange={(e) => setFormData({ ...formData, college_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="e.g. IIT Delhi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="organizer@college.edu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Additional Details & Social Links</h3>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description / Bio</label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 min-h-[100px]"
                placeholder="A short bio or description about the organizer or club..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Website URL</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={formData.website || ""}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    placeholder="https://"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">LinkedIn Profile</label>
                <div className="relative">
                  <Linkedin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={formData.linkedin || ""}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Instagram Handle/URL</label>
                <div className="relative">
                  <Instagram className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.instagram || ""}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    placeholder="@handle or URL"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingOrganizer ? "Update Organizer" : "Create Organizer"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search organizers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Organizer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrganizers.map((org) => (
          <div key={org.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden relative flex items-center justify-center border border-slate-200">
                  {org.photo_url ? (
                    <Image src={org.photo_url} alt={org.name} fill className="object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 leading-tight">{org.name}</h3>
                  {org.designation && <p className="text-xs font-medium text-slate-500">{org.designation}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(org)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(org.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {(org.organization_name || org.college_name) && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="w-4 flex justify-center"><User className="w-3.5 h-3.5" /></span>
                  <span className="truncate">
                    {[org.organization_name, org.college_name].filter(Boolean).join(" • ")}
                  </span>
                </div>
              )}
              {org.email && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="w-4 flex justify-center"><Mail className="w-3.5 h-3.5" /></span>
                  <span className="truncate">{org.email}</span>
                </div>
              )}
              {org.phone && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="w-4 flex justify-center"><Phone className="w-3.5 h-3.5" /></span>
                  <span>{org.phone}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
              {org.website && (
                <a href={org.website} target="_blank" rel="noreferrer" className="p-1.5 bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {org.linkedin && (
                <a href={org.linkedin} target="_blank" rel="noreferrer" className="p-1.5 bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {org.instagram && (
                <a href={org.instagram} target="_blank" rel="noreferrer" className="p-1.5 bg-slate-50 text-slate-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {(!org.website && !org.linkedin && !org.instagram) && (
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">No Social Links</span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {filteredOrganizers.length === 0 && (
        <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
          <User className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold text-slate-700">No organizers found</p>
          <p className="text-sm mt-1">Create an organizer profile to associate with events.</p>
        </div>
      )}
    </div>
  );
}
