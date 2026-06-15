"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { seedWorld } from "@/lib/generation/starter-pack";

/**
 * Seed a new world from the home form: create it, pre-generate the starter pack,
 * then redirect to its home article. This blocks until the starter pack is written
 * (several model calls), so the form shows a pending state while it runs.
 */
export async function seedAction(formData: FormData) {
  const seed = String(formData.get("seed") ?? "").trim();
  if (!seed) return;

  const { worldId, homeSlug } = await seedWorld(getDb(), seed);
  redirect(`/w/${worldId}/${homeSlug}`);
}
