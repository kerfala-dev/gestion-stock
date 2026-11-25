import * as repository from "./dashboard.repository.js";

export function getDashboard(organizationId: string) {
	return repository.getDashboardData(organizationId);
}