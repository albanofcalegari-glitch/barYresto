"use server";

import { createSafeAction } from "@/lib/action-utils";
import { updateRestaurant, changeRestaurantStatus, deleteRestaurant } from "./actions";

export const safeUpdateRestaurant = createSafeAction(updateRestaurant);
export const safeChangeRestaurantStatus = createSafeAction(changeRestaurantStatus);
export const safeDeleteRestaurant = createSafeAction(deleteRestaurant);
