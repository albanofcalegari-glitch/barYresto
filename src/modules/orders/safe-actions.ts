"use server";

import { createSafeAction } from "@/lib/action-utils";
import {
  openOrder,
  addItemToOrder,
  removeItemFromOrder,
  fireOrder,
  requestClose,
  registerPayment,
  cancelOrder,
} from "./actions";

export const safeOpenOrder = createSafeAction(openOrder);
export const safeAddItemToOrder = createSafeAction(addItemToOrder);
export const safeRemoveItemFromOrder = createSafeAction(removeItemFromOrder);
export const safeFireOrder = createSafeAction(fireOrder);
export const safeRequestClose = createSafeAction(requestClose);
export const safeRegisterPayment = createSafeAction(registerPayment);
export const safeCancelOrder = createSafeAction(cancelOrder);
