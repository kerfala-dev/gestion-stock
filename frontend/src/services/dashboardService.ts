import { apiRequest } from "./api";

import type { DashboardData } from "../types/dashboard";

export async function getDashboard(
  signal?: AbortSignal
): Promise<DashboardData> {
  return apiRequest<DashboardData>(
    "/dashboard",
    { signal }
  );
}