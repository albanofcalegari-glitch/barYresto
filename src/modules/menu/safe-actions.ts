"use server";

import { createSafeAction } from "@/lib/action-utils";
import {
  createCategory,
  deleteCategory,
  toggleItemAvailability,
  deleteItem,
} from "./actions";

export const safeCreateCategory = createSafeAction(createCategory);
export const safeDeleteCategory = createSafeAction(deleteCategory);
export const safeToggleItemAvailability = createSafeAction(toggleItemAvailability);
export const safeDeleteItem = createSafeAction(deleteItem);
