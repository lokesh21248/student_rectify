"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, UploadCloud, Link as LinkIcon, Trash2, GripVertical, Image as ImageIcon, Play, Star } from "lucide-react";

export function GalleryMediaClient({ gallery, initialMedia }: { gallery: any, initialMedia: any[] }) {
  const router = useRouter();
  const [media, setMedia] = useState(initialMedia);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Video Link Form
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsUploading(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(Math.round(((i) / files.length) * 100));

      const isVideo = file.type.startsWith("video/");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `galleries/${gallery.id}`);

      try {
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error);

        const newMedia = {
          gallery_id: gallery.id,
          media_type: isVideo ? "video" : "photo",
          media_url: uploadData.url,
          title: file.name,
          display_order: media.length + successCount,
        };

        const dbRes = await fetch("/api/admin/gallery/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMedia),
        });
        
        const dbData = await dbRes.json();
        if (dbRes.ok) {
          setMedia(prev => [...prev, dbData]);
          successCount++;
        }
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploadProgress(100);
    setTimeout(() => setIsUploading(false), 500);
    
    if (successCount > 0) {
      toast.success(`Successfully added ${successCount} media items`);
      router.refresh();
    }
  };

  const handleAddVideoLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return;

    try {
      const newMedia = {
        gallery_id: gallery.id,
        media_type: "video",
        media_url: videoUrl,
        title: videoTitle || "Video Link",
        display_order: media.length,
      };

      const dbRes = await fetch("/api/admin/gallery/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMedia),
      });
      
      const dbData = await dbRes.json();
      if (!dbRes.ok) throw new Error(dbData.error);
      
      setMedia(prev => [...prev, dbData]);
      setShowVideoModal(false);
      setVideoUrl("");
      setVideoTitle("");
      toast.success("Video link added");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to add video link");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this media item?")) return;
    try {
      const res = await fetch(`/api/admin/gallery/media/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setMedia(media.filter(m => m.id !== id));
      toast.success("Removed");
      router.refresh();
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const handleSetCover = async (url: string) => {
    try {
      const res = await fetch(`/api/admin/gallery/${gallery.id}/cover`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cover_image_url: url }),
      });
      if (!res.ok) throw new Error();
      toast.success("Cover image updated");
      router.refresh();
    } catch (err) {
      toast.error("Failed to update cover");
    }
  };

  return (
    <div className="container-page py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/gallery" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{gallery.name}</h1>
          <p className="text-sm text-slate-500">Event: {gallery.events?.title || "Unknown"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="flex-1">
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-xl cursor-pointer transition-colors">
                <UploadCloud className="w-8 h-8 text-blue-500 mb-2" />
                <span className="text-sm font-semibold text-blue-700">Upload Photos / Videos</span>
                <span className="text-xs text-blue-500/70">JPG, PNG, WEBM, MP4 (Max 10MB)</span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,video/*" 
                  className="hidden" 
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            <div className="w-px h-24 bg-slate-200 hidden sm:block"></div>
            <div className="flex-1 text-center hidden sm:block">
              <button 
                onClick={() => setShowVideoModal(true)}
                className="w-full flex flex-col items-center justify-center h-32 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <LinkIcon className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm font-semibold text-slate-700">Add Video Link</span>
                <span className="text-xs text-slate-500">YouTube, Vimeo</span>
              </button>
            </div>
          </div>
          
          {isUploading && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex justify-between text-xs font-semibold text-blue-700 mb-2">
                <span>Uploading files...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          Gallery Media <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">{media.length}</span>
        </h2>
        
        {media.length === 0 ? (
          <div className="py-12 text-center text-slate-500 border-2 border-dashed border-slate-100 rounded-xl">
            <ImageIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p>No media added yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {media.map((item, index) => (
              <div key={item.id} className="group relative aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                {item.media_type === 'video' ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                    <Play className="w-8 h-8 text-white/50" />
                  </div>
                ) : (
                  <img src={item.media_url} alt="" className="w-full h-full object-cover" />
                )}
                
                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <div className="p-1.5 bg-white/10 backdrop-blur rounded text-[10px] text-white font-bold uppercase border border-white/20">
                      {item.media_type}
                    </div>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  {item.media_type === 'photo' && (
                    <button 
                      onClick={() => handleSetCover(item.media_url)}
                      className="w-full py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur border border-white/20 text-white text-[10px] font-bold rounded flex items-center justify-center gap-1 transition-colors"
                    >
                      <Star className="w-3 h-3" /> Set Cover
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Video Link</h3>
            <form onSubmit={handleAddVideoLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Video Title (Optional)</label>
                <input 
                  type="text" 
                  value={videoTitle}
                  onChange={e => setVideoTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-blue-500" 
                  placeholder="e.g. Day 1 Highlights" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Video URL (YouTube/Vimeo) *</label>
                <input 
                  type="url" 
                  required
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-blue-500" 
                  placeholder="https://youtube.com/watch?v=..." 
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowVideoModal(false)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold text-sm">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm">
                  Add Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
