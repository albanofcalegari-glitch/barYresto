"use server";

import { createSafeAction } from "@/lib/action-utils";
import { createCustomer, deleteCustomer } from "./actions";

export const safeCreateCustomer = createSafeAction(createCustomer);
export const safeDeleteCustomer = createSafeAction(deleteCustomer);
