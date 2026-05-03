"use server";

import { createSafeAction } from "@/lib/action-utils";
import { createSpecialDay, deleteSpecialDay } from "./actions";

export const safeCreateSpecialDay = createSafeAction(createSpecialDay);
export const safeDeleteSpecialDay = createSafeAction(deleteSpecialDay);
