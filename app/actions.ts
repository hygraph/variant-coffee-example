"use server";

import { cookies } from "next/headers";

export async function setSegment(segment: string) {
  const cookieStore = await cookies();
  if (!segment) {
    cookieStore.delete("segment");
    return;
  }

  cookieStore.set("segment", segment);
}
