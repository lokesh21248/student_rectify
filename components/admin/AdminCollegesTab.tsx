"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, Check, X, Building2, MapPin } from "lucide-react";

export function AdminCollegesTab({ colleges: initialColleges }: { colleges: any[] }) {
  const [colleges, setColleges] = useState(initialColleges);
  const [showForm, setShowForm] = useState(false);
  const [editingCollege, setEditingCollege] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    institution_type: "College",
    location: "",
    state: "",
    country: "India",
    logo_url: "",
    is_active: true,
    sort_order: 0,
  });

  const handleOpenForm = (college?: any) => {
    if (college) {
      setEditingCollege(college);
      setForm({
        name: college.name,
        slug: college.slug,
        institution_type: college.institution_type || "College",
        location: college.location || "",
        state: college.state || "",
        country: college.country || "India",
        logo_url: college.logo_url || "",
        is_active: college.is_active !== false,
        sort_order: college.sort_order || 0,
      });
    } else {
      setEditingCollege(null);
      setForm({
        name: "",
        slug: "",
        institution_type: "College",
        location: "",
        state: "",
        country: "India",
        logo_url: "",
        is_active: true,
        sort_order: 0,
      });
    }
    setShowForm(true);
  };

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setForm({ ...form, name, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("submit");
    try {
      const url = editingCollege ? `/api/admin/colleges/${editingCollege.id}` : "/api/admin/colleges";
      const method = editingCollege ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save college");

      if (editingCollege) {
        setColleges(colleges.map(c => c.id === editingCollege.id ? data.college : c));
        toast.success("College updated successfully");
      } else {
        setColleges([...colleges, data.college]);
        toast.success("College added successfully");
      }
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this college?")) return;
    setLoading(`delete-${id}`);
    try {
      const res = await fetch(`/api/admin/colleges/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      setColleges(colleges.filter(c => c.id !== id));
      toast.success("College deleted");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Partner Colleges</h2>
          <p className="text-sm text-slate-500">Manage registered institutions</p>
        </div>
        {!showForm && (
          <button
            onClick={() => handleOpenForm()}
            className="w-full sm:w-auto px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Partner College
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">{editingCollege ? "Edit College" : "Add New College"}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Institution Name *</label>
                <input required type="text" value={form.name} onChange={(e) => handleNameChange(e.target.value)} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-primary-500 outline-none" placeholder="e.g. BITS Pilani" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Slug *</label>
                <input required type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:border-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Institution Type</label>
                <select value={form.institution_type} onChange={(e) => setForm({ ...form, institution_type: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-primary-500 outline-none">
                  <option value="College">College</option>
                  <option value="University">University</option>
                  <option value="Institute">Institute</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Institution Logo URL</label>
                <input type="url" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-primary-500 outline-none" placeholder="https://..." />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">City/Location *</label>
                <input required type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-primary-500 outline-none" placeholder="e.g. Pilani" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
                <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-primary-500 outline-none" placeholder="e.g. Rajasthan" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
                <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-primary-500 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="flex items-center gap-2 cursor-pointer mt-8 text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" />
                  Active Status
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sort Order</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-primary-500 outline-none" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-100">
              <button type="button" onClick={() => setShowForm(false)} className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors">Cancel</button>
              <button type="submit" disabled={loading === "submit"} className="w-full sm:w-auto px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                {loading === "submit" && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingCollege ? "Save Changes" : "Add College"}
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colleges.map((college) => (
            <div key={college.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-primary-300 transition-colors flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {college.logo_url ? (
                    <img src={college.logo_url} alt={college.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">{college.name}</h3>
                  <p className="text-xs text-primary-600 font-medium mb-1">{college.institution_type}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3" />
                    {college.location}{college.state ? `, ${college.state}` : ''}
                  </p>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className={`px-2 py-1 text-[10px] font-semibold rounded-full ${college.is_active !== false ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {college.is_active !== false ? "Active" : "Inactive"}
                </span>
                
                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenForm(college)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(college.id)} disabled={loading === `delete-${college.id}`} className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors disabled:opacity-50">
                    {loading === `delete-${college.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {colleges.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl">
              No partner colleges found. Add one to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
