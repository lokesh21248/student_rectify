"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
  defaultInitials?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder = "organizer-images",
  label = "Upload Photo",
  className,
  defaultInitials,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload image");

      onChange(data.url);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0]);
          }
        }}
      />

      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-4">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-white">
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white/90 backdrop-blur border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              disabled={isUploading}
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors shadow-sm border border-red-100"
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin mb-2" />
              <p className="text-xs font-semibold text-slate-700">Uploading...</p>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            "relative w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 transition-all cursor-pointer overflow-hidden",
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400"
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center text-blue-600">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <p className="text-sm font-medium">Uploading image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-slate-500">
              {defaultInitials ? (
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl mb-4 shadow-sm border-2 border-white">
                  {defaultInitials}
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center mb-3 text-slate-400">
                  <UploadCloud className="w-6 h-6" />
                </div>
              )}
              <p className="text-sm font-semibold text-slate-700 mb-1">{label}</p>
              <p className="text-xs text-slate-400 text-center max-w-[200px]">
                Drag and drop or click to upload
              </p>
              <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wider">
                PNG, JPG, WEBP • Max 5MB
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
