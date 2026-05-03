"use server";

import { createSafeAction } from "@/lib/action-utils";
import { inviteUser, changeUserRole, revokeUser } from "./actions";

export const safeInviteUser = createSafeAction(inviteUser);
export const safeChangeUserRole = createSafeAction(changeUserRole);
export const safeRevokeUser = createSafeAction(revokeUser);
