"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, Check, X, UploadCloud, Image as ImageIcon } from "lucide-react";
import { Category } from "@/types";

export function AdminCategoriesTab({ categories: initialCategories }: { categories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "more-horizontal",
    color: "#6366F1",
    sort_order: 0,
    is_active: true,
    icon_type: "library" as "library" | "upload" | "url",
    icon_url: "",
    image_url: "",
  });

  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [iconMode, setIconMode] = useState<"library" | "upload" | "url">("library");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const handleOpenForm = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setForm({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        icon: category.icon || "more-horizontal",
        color: category.color || "#6366F1",
        sort_order: category.sort_order || 0,
        is_active: category.is_active !== false && category.status !== 'inactive',
        icon_type: (category.icon_type as any) || "library",
        icon_url: category.icon_url || "",
        image_url: category.image_url || "",
      });
      setImageMode(category.image_url ? "url" : "upload");
      setIconMode((category.icon_type as any) || "library");
    } else {
      setEditingCategory(null);
      setForm({
        name: "",
        slug: "",
        description: "",
        icon: "more-horizontal",
        color: "#6366F1",
        sort_order: 0,
        is_active: true,
        icon_type: "library",
        icon_url: "",
        image_url: "",
      });
      setImageMode("upload");
      setIconMode("library");
    }
    setImageFile(null);
    setImagePreview(null);
    setIconFile(null);
    setIconPreview(null);
    setShowForm(true);
  };

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setForm({ ...form, name, slug });
  };

  const uploadFileToSupabase = async (file: File, bucket: string, folder: string) => {
    const data = new FormData();
    data.append("file", file);
    data.append("bucket", bucket);
    data.append("folder", folder);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: data,
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "File upload failed");
    return result.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("submit");
    try {
      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : "/api/admin/categories";
      const method = editingCategory ? "PATCH" : "POST";
      
      const payload: any = { ...form };
      payload.status = payload.is_active ? 'active' : 'inactive';
      delete payload.is_active;

      // Retain old values until upload succeeds
      if (imageMode === "upload") payload.image_url = editingCategory?.image_url || "";
      if (iconMode === "upload") payload.icon_url = editingCategory?.icon_url || "";
      payload.icon_type = iconMode;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save category");

      const categoryId = editingCategory ? editingCategory.id : data.category.id;
      let finalImageUrl = data.category.image_url;
      let finalIconUrl = data.category.icon_url;
      let needsPatch = false;

      // Image Upload
      if (imageMode === "upload" && imageFile) {
        try {
          const uploadedUrl = await uploadFileToSupabase(imageFile, "category-images", `categories/${categoryId}`);
          finalImageUrl = uploadedUrl + "?t=" + Date.now();
          needsPatch = true;
        } catch (err: any) {
          toast.error("Image upload failed: " + err.message);
        }
      }

      // Icon Upload
      if (iconMode === "upload" && iconFile) {
        try {
          const uploadedUrl = await uploadFileToSupabase(iconFile, "category-images", `categories/${categoryId}`);
          finalIconUrl = uploadedUrl + "?t=" + Date.now();
          needsPatch = true;
        } catch (err: any) {
          toast.error("Icon upload failed: " + err.message);
        }
      }

      // Final Patch if uploads happened
      if (needsPatch) {
        const patchRes = await fetch(`/api/admin/categories/${categoryId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_url: finalImageUrl, icon_url: finalIconUrl }),
        });
        const patchData = await patchRes.json();
        if (patchRes.ok) {
          data.category = patchData.category;
        }
      }

      // Ensure is_active mapping
      data.category.is_active = data.category.status !== 'inactive';

      if (editingCategory) {
        setCategories(categories.map(c => c.id === categoryId ? data.category : c));
        toast.success("Category updated successfully");
      } else {
        setCategories([...categories, data.category].sort((a, b) => a.sort_order - b.sort_order));
        toast.success("Category added successfully");
      }
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    setLoading(`delete-${id}`);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      setCategories(categories.filter(c => c.id !== id));
      toast.success("Category deleted");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'icon') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please use PNG, JPG, JPEG, or WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB.");
      return;
    }

    const preview = URL.createObjectURL(file);
    if (type === 'image') {
      setImageFile(file);
      setImagePreview(preview);
    } else {
      setIconFile(file);
      setIconPreview(preview);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Category Management</h2>
          <p className="text-sm text-slate-500 mt-1">Add, edit, or remove event categories</p>
        </div>
        {!showForm && (
          <button
            onClick={() => handleOpenForm()}
            className="w-full sm:w-auto px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-sm text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-8 relative">
          <button
            onClick={() => { setShowForm(false); setEditingCategory(null); }}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">{editingCategory ? "Edit Category" : "Create Category"}</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category Name *</label>
                <input required type="text" value={form.name} onChange={(e) => handleNameChange(e.target.value)} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-primary-500 outline-none" placeholder="e.g. Technology" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Slug *</label>
                <input required type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:border-primary-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-primary-500 outline-none" placeholder="Short description..." />
            </div>

            {/* Category Image Section */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-slate-900">Category Image</label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button type="button" onClick={() => setImageMode("upload")} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${imageMode === "upload" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>Upload Image</button>
                  <button type="button" onClick={() => setImageMode("url")} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${imageMode === "url" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>Image URL</button>
                </div>
              </div>

              {imageMode === "url" ? (
                <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-xs focus:border-primary-500 outline-none" placeholder="https://..." />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-8 h-8 mb-2 text-slate-400" />
                        <p className="mb-1 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> category image</p>
                        <p className="text-xs text-slate-400">PNG, JPG, WEBP (Max 5MB)</p>
                      </div>
                      <input type="file" className="hidden" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={(e) => handleFileChange(e, 'image')} />
                    </label>
                  </div>
                  {(imagePreview || form.image_url) && (
                    <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200">
                      <div className="w-24 h-14 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                        <img src={imagePreview || form.image_url} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{imageFile ? imageFile.name : "Current Image"}</p>
                      </div>
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); setForm({...form, image_url: ""}); }} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Icon Section */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-slate-900">Icon Type</label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button type="button" onClick={() => setIconMode("library")} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${iconMode === "library" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>Library</button>
                  <button type="button" onClick={() => setIconMode("upload")} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${iconMode === "upload" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>Upload</button>
                  <button type="button" onClick={() => setIconMode("url")} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${iconMode === "url" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>URL</button>
                </div>
              </div>

              {iconMode === "library" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Lucide Icon Name</label>
                  <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-xs focus:border-primary-500 outline-none font-mono" placeholder="e.g. cpu, code" />
                </div>
              )}

              {iconMode === "url" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Icon URL</label>
                  <input type="url" value={form.icon_url} onChange={(e) => setForm({ ...form, icon_url: e.target.value })} className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-xs focus:border-primary-500 outline-none" placeholder="https://..." />
                </div>
              )}

              {iconMode === "upload" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-6 h-6 mb-2 text-slate-400" />
                        <p className="text-xs text-slate-400">Upload Icon (PNG, SVG, WEBP)</p>
                      </div>
                      <input type="file" className="hidden" accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml" onChange={(e) => handleFileChange(e, 'icon')} />
                    </label>
                  </div>
                  {(iconPreview || form.icon_url) && (
                    <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 p-1">
                        <img src={iconPreview || form.icon_url} alt="Icon Preview" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{iconFile ? iconFile.name : "Current Icon"}</p>
                      </div>
                      <button type="button" onClick={() => { setIconFile(null); setIconPreview(null); setForm({...form, icon_url: ""}); }} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Color (Hex)</label>
                <div className="flex gap-2">
                  <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-11 w-11 p-1 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer" />
                  <input type="text" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:border-primary-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sort Order</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-primary-500 outline-none" />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer mt-8 text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" />
                  Active Status
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-100">
              <button type="button" onClick={() => setShowForm(false)} className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors">Cancel</button>
              <button type="submit" disabled={loading === "submit"} className="w-full sm:w-auto px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                {loading === "submit" && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingCategory ? "Save Changes" : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
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
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-100 overflow-hidden"
                          style={cat.image_url ? {} : { backgroundColor: `${cat.color}20`, color: cat.color }}
                        >
                          {cat.image_url ? (
                            <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                          ) : cat.icon_type === "upload" || cat.icon_type === "url" ? (
                            <img src={cat.icon_url || ""} alt="Icon" className="w-6 h-6 object-contain" />
                          ) : (
                            <span className="font-bold uppercase">{cat.icon?.charAt(0) || "C"}</span>
                          )}
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
                        cat.status !== 'inactive' && cat.is_active !== false ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}>{cat.status !== 'inactive' && cat.is_active !== false ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenForm(cat)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(cat.id)}
                          disabled={loading === `delete-${cat.id}`}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {loading === `delete-${cat.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
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
      )}
    </div>
  );
}
