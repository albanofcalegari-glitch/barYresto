"use server";

import { createSafeAction } from "@/lib/action-utils";
import {
  confirmReservation,
  cancelReservation,
  markArrived,
  markNoShow,
  completeReservation,
} from "./actions";

export const safeConfirmReservation = createSafeAction(confirmReservation);
export const safeCancelReservation = createSafeAction(cancelReservation);
export const safeMarkArrived = createSafeAction(markArrived);
export const safeMarkNoShow = createSafeAction(markNoShow);
export const safeCompleteReservation = createSafeAction(completeReservation);
