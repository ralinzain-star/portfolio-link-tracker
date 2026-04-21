"use server";

import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export async function createLink(formData: FormData) {
  const company = formData.get("company") as string;
  const originalUrl = formData.get("originalUrl") as string;

  if (!company || !originalUrl) {
    return { error: "公司名稱與原始連結為必填。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "未登入。" };
  }

  const slug = nanoid(8);

  const { error } = await supabase.from("links").insert({
    slug,
    company,
    original_url: originalUrl,
    created_by: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return { slug, url: `${baseUrl}/p/${slug}` };
}

export async function deleteLink(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("links").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}
