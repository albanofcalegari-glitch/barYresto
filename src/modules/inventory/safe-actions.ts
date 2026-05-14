"use server";

import { createSafeAction } from "@/lib/action-utils";
import {
  createSupplier,
  updateSupplier,
  deleteSupplier,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
  addRecipeIngredient,
  removeRecipeIngredient,
  registerStockEntry,
} from "./actions";

export const safeCreateSupplier = createSafeAction(createSupplier);
export const safeUpdateSupplier = createSafeAction(updateSupplier);
export const safeDeleteSupplier = createSafeAction(deleteSupplier);
export const safeCreateRawMaterial = createSafeAction(createRawMaterial);
export const safeUpdateRawMaterial = createSafeAction(updateRawMaterial);
export const safeDeleteRawMaterial = createSafeAction(deleteRawMaterial);
export const safeAddRecipeIngredient = createSafeAction(addRecipeIngredient);
export const safeRemoveRecipeIngredient = createSafeAction(removeRecipeIngredient);
export const safeRegisterStockEntry = createSafeAction(registerStockEntry);
