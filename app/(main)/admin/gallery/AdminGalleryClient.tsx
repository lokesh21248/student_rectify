"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Plus, Image as ImageIcon, Video, Trash2, Edit } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AdminGalleryClientProps {
  initialGalleries: any[];
  events: any[];
}

export function AdminGalleryClient({ initialGalleries, events }: AdminGalleryClientProps) {
  const router = useRouter();
  const [galleries, setGalleries] = useState(initialGalleries);
  const [isCreating, setIsCreating] = useState(false);
  
  // Create form state
  const [name, setName] = useState("");
  const [eventId, setEventId] = useState("");
  const [status, setStatus] = useState("draft");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !eventId) {
      toast.error("Name and Event are required");
      return;
    }

    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, event_id: eventId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success("Gallery created successfully");
      router.push(`/admin/gallery/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create gallery");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery? All media will be removed.")) return;
    
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      setGalleries(galleries.filter(g => g.id !== id));
      toast.success("Gallery deleted");
    } catch (err) {
      toast.error("Failed to delete gallery");
    }
  };

  return (
    <div className="container-page py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Galleries</h1>
            <p className="text-sm text-slate-500">Create and manage event photo/video galleries</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isCreating ? "Cancel" : <><Plus className="w-4 h-4" /> New Gallery</>}
        </button>
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Create New Gallery</h2>
          <form onSubmit={handleCreate} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gallery Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-blue-500 text-sm"
                placeholder="e.g. TechFest 2024 Day 1"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Event</label>
              <select
                required
                value={eventId}
                onChange={e => setEventId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-blue-500 text-sm"
              >
                <option value="">-- Choose Event --</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-blue-500 text-sm"
              >
                <option value="draft">Draft (Hidden)</option>
                <option value="published">Published</option>
              </select>
            </div>
            <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
              Create & Add Media
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleries.map(gallery => (
          <div key={gallery.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-video bg-slate-100 relative border-b border-slate-100">
              {gallery.cover_image_url ? (
                <img src={gallery.cover_image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                  <ImageIcon className="w-10 h-10" />
                </div>
              )}
              <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur rounded text-xs font-bold shadow-sm">
                <span className={gallery.status === 'published' ? 'text-emerald-600' : 'text-amber-600'}>
                  {gallery.status.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-slate-900 mb-1 truncate">{gallery.name}</h3>
              <p className="text-xs text-slate-500 mb-4 truncate">{gallery.events?.title || "Unknown Event"}</p>
              
              <div className="flex gap-2">
                <Link 
                  href={`/admin/gallery/${gallery.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Edit className="w-4 h-4" /> Manage Media
                </Link>
                <button 
                  onClick={() => handleDelete(gallery.id)}
                  className="px-3 py-2 border border-red-100 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {galleries.length === 0 && !isCreating && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No galleries found. Create one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
