"use server";

import { createSafeAction } from "@/lib/action-utils";
import { addMediaAsset, deleteMediaAsset, reorderMediaAsset } from "./actions";

export const safeAddMediaAsset = createSafeAction(addMediaAsset);
export const safeDeleteMediaAsset = createSafeAction(deleteMediaAsset);
export const safeReorderMediaAsset = createSafeAction(reorderMediaAsset);
