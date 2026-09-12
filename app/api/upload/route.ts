import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getExtension(filename: string, mimeType: string): string {
  const fromName = filename.split(".").pop()?.toLowerCase();
  if (fromName && fromName.length <= 4) return fromName;
  // Fallback from mime type
  const mimeMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "application/pdf": "pdf",
  };
  return mimeMap[mimeType] || "bin";
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authorization check (Clerk user or Admin session)
    const { userId } = await auth();
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const isAdmin = adminSession?.value === "authenticated";

    if (!userId && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized upload" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const reqBucket = (formData.get("bucket") as string) || "";
    const folder = (formData.get("folder") as string) || "admin-uploads";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Max allowed size is 10MB." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: "Invalid file type. Supported: JPEG, PNG, WebP, GIF, SVG, PDF, DOCX, TXT.",
      }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Discover available buckets
    let targetBucket = "dinesh_project"; // Default bucket name
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const existingNames = (buckets || []).map((b: any) => b.name);

      if (reqBucket && existingNames.includes(reqBucket)) {
        targetBucket = reqBucket;
      } else if (existingNames.includes("dinesh_project")) {
        targetBucket = "dinesh_project";
      } else if (existingNames.length > 0) {
        targetBucket = existingNames[0];
      } else {
        // Try creating 'dinesh_project' bucket as public
        const { error: bucketError } = await supabase.storage.createBucket("dinesh_project", {
          public: true,
          fileSizeLimit: 10 * 1024 * 1024,
        });
        if (!bucketError) targetBucket = "dinesh_project";
      }
    } catch (bucketErr) {
      console.error("Bucket discovery error:", bucketErr);
    }

    // Generate a unique filename using UUID to avoid collisions
    const uuid = generateUUID();
    const ext = getExtension(file.name, file.type);
    const prefix = file.type.startsWith("image/") ? "img" : "doc";
    const fileName = `${folder}/${prefix}_${uuid}.${ext}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Upload to targetBucket
    let uploadResult = await supabase.storage
      .from(targetBucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false, // Don't overwrite - use UUID names instead
      });

    // If initial upload failed, try fallback buckets
    if (uploadResult.error) {
      console.error(`Upload to ${targetBucket} failed:`, uploadResult.error.message);

      // Try dinesh_project explicitly as fallback
      if (targetBucket !== "dinesh_project") {
        uploadResult = await supabase.storage
          .from("dinesh_project")
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: false,
          });
        if (!uploadResult.error) {
          targetBucket = "dinesh_project";
        }
      }
    }

    if (uploadResult.error) {
      console.error("Storage upload final error:", uploadResult.error);

      // Last resort: return base64 for images so admin workflow doesn't break
      if (file.type.startsWith("image/")) {
        const base64 = buffer.toString("base64");
        const dataUrl = `data:${file.type};base64,${base64}`;
        return NextResponse.json({
          url: dataUrl,
          path: null,
          name: file.name,
          bucket: "local-fallback",
          fallback: true,
          warning: "Image stored as data URL. Please check Supabase storage bucket settings.",
          success: true,
        });
      }

      return NextResponse.json(
        { error: "Storage upload failed: " + uploadResult.error.message },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from(targetBucket)
      .getPublicUrl(uploadResult.data.path);

    return NextResponse.json({
      url: urlData.publicUrl,
      path: uploadResult.data.path,
      bucket: targetBucket,
      name: file.name,
      size: file.size,
      type: file.type,
      success: true,
    });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 });
  }
}
