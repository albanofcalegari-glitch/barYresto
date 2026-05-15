"use server";

import { createSafeAction } from "@/lib/action-utils";
import { registerRestaurant } from "./actions";

export const safeRegisterRestaurant = createSafeAction(registerRestaurant);
