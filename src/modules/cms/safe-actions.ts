"use server";

import { createSafeAction } from "@/lib/action-utils";
import { updateSiteContent, updateRestaurantInfo } from "./actions";

export const safeUpdateSiteContent = createSafeAction(updateSiteContent);
export const safeUpdateRestaurantInfo = createSafeAction(updateRestaurantInfo);
