"use server";

import { createSafeAction } from "@/lib/action-utils";
import { createZone, deleteZone, createTable, deleteTable } from "./actions";

export const safeCreateZone = createSafeAction(createZone);
export const safeDeleteZone = createSafeAction(deleteZone);
export const safeCreateTable = createSafeAction(createTable);
export const safeDeleteTable = createSafeAction(deleteTable);
