import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const VALID_COLUMNS = new Set([
  "name",
  "slug",
  "description",
  "icon",
  "color",
  "sort_order",
  "is_active",
  "image_url",
  "icon_type",
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;
    const body = await req.json();

    const updateData: Record<string, any> = {};
    for (const key of Object.keys(body)) {
      if (VALID_COLUMNS.has(key)) {
        updateData[key] = body[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields provided for update" }, { status: 400 });
    }

    const supabase = createAdminClient();
    
    // Check if updating slug to an existing one
    if (updateData.slug) {
      const { data: existing } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", updateData.slug)
        .neq("id", categoryId)
        .single();
        
      if (existing) {
        return NextResponse.json({ error: "Category with this slug already exists" }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", categoryId)
      .select("*")
      .single();

    if (error) {
      console.error("Update category error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, category: data });
  } catch (error: any) {
    console.error("PATCH admin category catch:", error);
    return NextResponse.json({ error: error.message || "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;
    const supabase = createAdminClient();

    // Prevent deletion if there are events using it
    const { count, error: countErr } = await supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("category_id", categoryId);

    if (countErr) {
      return NextResponse.json({ error: "Failed to check category usage" }, { status: 500 });
    }

    if (count && count > 0) {
      return NextResponse.json({ 
        error: `Cannot delete: This category is currently used by ${count} event(s). Please deactivate it instead.` 
      }, { status: 400 });
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      console.error("Delete category error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("DELETE admin category catch:", error);
    return NextResponse.json({ error: error.message || "Failed to delete category" }, { status: 500 });
  }
}
